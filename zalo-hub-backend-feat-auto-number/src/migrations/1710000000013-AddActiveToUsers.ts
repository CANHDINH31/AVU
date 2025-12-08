import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveToUsers1710000000013 implements MigrationInterface {
  name = 'AddActiveToUsers1710000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`active\` tinyint NOT NULL DEFAULT 0 COMMENT '0: inactive, 1: active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`active\``);
  }
}
