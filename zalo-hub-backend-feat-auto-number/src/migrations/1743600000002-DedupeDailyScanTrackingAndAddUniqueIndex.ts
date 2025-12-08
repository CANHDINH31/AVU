import { MigrationInterface, QueryRunner } from 'typeorm';

export class DedupeDailyScanTrackingAndAddUniqueIndex1743600000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Xóa bản ghi trùng theo (accountId, trackingDate) giữ lại id nhỏ nhất
    await queryRunner.query(`
      DELETE t1 FROM daily_scan_tracking t1
      JOIN daily_scan_tracking t2
        ON t1.accountId = t2.accountId
       AND t1.trackingDate = t2.trackingDate
       AND t1.id > t2.id;
    `);

    // 2) Xóa index cũ nếu có (để tránh lỗi khi tạo)
    const existingIdx = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'daily_scan_tracking'
        AND INDEX_NAME = 'IDX_daily_scan_tracking_account_date'
      LIMIT 1;
    `);

    if (existingIdx.length > 0) {
      await queryRunner.query(`
        ALTER TABLE daily_scan_tracking
        DROP INDEX IDX_daily_scan_tracking_account_date;
      `);
    }

    // 3) Thêm unique index bảo vệ không cho tạo trùng nữa
    await queryRunner.query(`
      ALTER TABLE daily_scan_tracking
      ADD UNIQUE INDEX IDX_daily_scan_tracking_account_date (accountId, trackingDate);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const existingIdx = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'daily_scan_tracking'
        AND INDEX_NAME = 'IDX_daily_scan_tracking_account_date'
      LIMIT 1;
    `);

    if (existingIdx.length > 0) {
      await queryRunner.query(`
        ALTER TABLE daily_scan_tracking
        DROP INDEX IDX_daily_scan_tracking_account_date;
      `);
    }
  }
}
