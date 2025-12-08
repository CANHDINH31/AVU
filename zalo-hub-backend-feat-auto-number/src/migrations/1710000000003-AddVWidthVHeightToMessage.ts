import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVWidthVHeightToMessage1710000000003
  implements MigrationInterface
{
  name = 'AddVWidthVHeightToMessage1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`v_width\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`v_height\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`v_height\``,
    );
    await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`v_width\``);
  }
}
