import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToMessage1736000000000 implements MigrationInterface {
  name = 'AddSourceToMessage1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      ADD COLUMN \`source\` ENUM('backend', 'socket') NULL DEFAULT 'socket'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      DROP COLUMN \`source\`
    `);
  }
}
