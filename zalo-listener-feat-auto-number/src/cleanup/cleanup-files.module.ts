import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { CleanupFilesService } from "./cleanup-files.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  providers: [CleanupFilesService],
  exports: [CleanupFilesService],
})
export class CleanupFilesModule {}
