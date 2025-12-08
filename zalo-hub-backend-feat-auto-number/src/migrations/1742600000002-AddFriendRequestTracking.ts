import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFriendRequestTracking1742600000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE daily_scan_tracking
        ADD COLUMN dailyFriendRequestCount int NOT NULL DEFAULT 0,
        ADD COLUMN dailyFriendRequestLimit int NOT NULL DEFAULT 40,
        ADD COLUMN dailyUnfriendCount int NOT NULL DEFAULT 0,
        ADD COLUMN dailyUnfriendLimit int NOT NULL DEFAULT 40,
        ADD COLUMN totalFriendRequestsSent int NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE phone_numbers
        ADD COLUMN friendRequestsSent int NOT NULL DEFAULT 0,
        ADD COLUMN friendRequestsCanceled int NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE phone_numbers
        DROP COLUMN friendRequestsCanceled,
        DROP COLUMN friendRequestsSent
    `);

    await queryRunner.query(`
      ALTER TABLE daily_scan_tracking
        DROP COLUMN totalFriendRequestsSent,
        DROP COLUMN dailyUnfriendLimit,
        DROP COLUMN dailyUnfriendCount,
        DROP COLUMN dailyFriendRequestLimit,
        DROP COLUMN dailyFriendRequestCount
    `);
  }
}
