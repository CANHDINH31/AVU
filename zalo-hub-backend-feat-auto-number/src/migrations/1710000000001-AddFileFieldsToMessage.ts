import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileFieldsToMessage1710000000001 implements MigrationInterface {
  name = 'AddFileFieldsToMessage1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`file_size\` text`);
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`check_sum\` text`);
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`checksum_sha\` text`,
    );
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`file_ext\` text`);
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`fdata\` text`);
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`f_type\` integer`);
    await queryRunner.query(`ALTER TABLE \`messages\` ADD \`t_width\` integer`);
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`t_height\` integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`t_height\``,
    );
    await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`t_width\``);
    await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`f_type\``);
    await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`fdata\``);
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`file_ext\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`checksum_sha\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`check_sum\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`file_size\``,
    );
  }
}
