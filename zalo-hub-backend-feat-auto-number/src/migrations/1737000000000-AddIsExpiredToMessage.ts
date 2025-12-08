import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsExpiredToMessage1737000000000 implements MigrationInterface {
  name = 'AddIsExpiredToMessage1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      ADD COLUMN \`is_expired\` int NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      DROP COLUMN \`is_expired\`
    `);
  }
}
