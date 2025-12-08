import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateScanEnabledDefaultOnAccounts1742600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE accounts MODIFY scanEnabled tinyint(1) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE accounts MODIFY scanEnabled tinyint(1) NOT NULL DEFAULT 1`,
    );
  }
}
