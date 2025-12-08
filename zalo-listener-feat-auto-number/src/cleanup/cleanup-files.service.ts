import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DatabaseService } from "../database/database.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CleanupFilesService {
  private readonly logger = new Logger(CleanupFilesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanupExpiredFiles() {
    this.logger.log("Starting cleanup expired files job...");

    try {
      // Lấy các bản ghi đã quá 7 ngày
      const expiredFiles =
        await this.databaseService.getExpiredFailedFileStorage(7);

      if (expiredFiles.length === 0) {
        this.logger.log("No expired files to cleanup");
        return;
      }

      this.logger.log(
        `Found ${expiredFiles.length} expired file(s) to cleanup`
      );

      const uploadsDir = path.join(process.cwd(), "uploads");
      const deletedFileIds: number[] = [];
      const updatedMessageIds: number[] = [];
      let deletedFilesCount = 0;
      let failedDeletions = 0;

      for (const fileRecord of expiredFiles) {
        try {
          // Xóa file trên server
          // path trong DB là /uploads/filename.ext, cần extract filename
          const fileName = path.basename(fileRecord.path);
          const filePath = path.join(uploadsDir, fileName);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            deletedFilesCount++;
            this.logger.log(`Deleted file: ${filePath}`);
          } else {
            this.logger.warn(`File not found: ${filePath}`);
          }

          // Thu thập messageId để cập nhật
          if (
            fileRecord.messageId &&
            !updatedMessageIds.includes(fileRecord.messageId)
          ) {
            updatedMessageIds.push(fileRecord.messageId);
          }

          // Thu thập id để xóa bản ghi
          deletedFileIds.push(fileRecord.id);
        } catch (error) {
          failedDeletions++;
          this.logger.error(
            `Error deleting file ${fileRecord.path}: ${error.message}`
          );
        }
      }

      // Cập nhật isExpired = 0 cho các message
      if (updatedMessageIds.length > 0) {
        await this.databaseService.updateMessagesIsExpired(updatedMessageIds);
        this.logger.log(
          `Updated ${updatedMessageIds.length} message(s) isExpired to 0`
        );
      }

      // Xóa bản ghi trong bảng failed_file_storage
      if (deletedFileIds.length > 0) {
        await this.databaseService.deleteFailedFileStorageByIds(deletedFileIds);
        this.logger.log(
          `Deleted ${deletedFileIds.length} record(s) from failed_file_storage table`
        );
      }

      this.logger.log(
        `Cleanup completed: ${deletedFilesCount} file(s) deleted, ${failedDeletions} failed`
      );
    } catch (error) {
      this.logger.error(
        `Error in cleanup expired files job: ${error.message}`,
        error.stack
      );
    }
  }
}
