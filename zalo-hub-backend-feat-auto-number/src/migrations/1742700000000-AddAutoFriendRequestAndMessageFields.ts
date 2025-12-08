import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutoFriendRequestAndMessageFields1742700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
        ADD COLUMN autoFriendRequestEnabled boolean NOT NULL DEFAULT false,
        ADD COLUMN friendRequestStartTime varchar(255) NULL,
        ADD COLUMN autoMessageEnabled boolean NOT NULL DEFAULT false,
        ADD COLUMN messageStartTime varchar(255) NULL,
        ADD COLUMN bulkMessageContent text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
        DROP COLUMN bulkMessageContent,
        DROP COLUMN messageStartTime,
        DROP COLUMN autoMessageEnabled,
        DROP COLUMN friendRequestStartTime,
        DROP COLUMN autoFriendRequestEnabled
    `);
  }
}
