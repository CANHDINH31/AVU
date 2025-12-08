import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutoFriendRequestCounters1743000000000
  implements MigrationInterface
{
  name = 'AddAutoFriendRequestCounters1743000000000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
        ADD COLUMN totalFriendRequestsSent int NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE phone_numbers
        ADD COLUMN lastFriendRequestSentAt timestamp NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE phone_numbers
        DROP COLUMN lastFriendRequestSentAt
    `);

    await queryRunner.query(`
      ALTER TABLE accounts
        DROP COLUMN totalFriendRequestsSent
    `);
  }
}
