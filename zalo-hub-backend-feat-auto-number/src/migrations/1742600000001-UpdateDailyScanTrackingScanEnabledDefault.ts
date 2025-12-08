import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDailyScanTrackingScanEnabledDefault1742600000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE daily_scan_tracking MODIFY scanEnabled tinyint(1) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE daily_scan_tracking MODIFY scanEnabled tinyint(1) NOT NULL DEFAULT 1`,
    );
  }
}
