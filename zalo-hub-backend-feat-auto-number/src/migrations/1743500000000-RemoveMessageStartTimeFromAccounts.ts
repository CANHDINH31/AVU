import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMessageStartTimeFromAccounts1743500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
        DROP COLUMN messageStartTime
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
        ADD COLUMN messageStartTime varchar(255) NULL
    `);
  }
}
