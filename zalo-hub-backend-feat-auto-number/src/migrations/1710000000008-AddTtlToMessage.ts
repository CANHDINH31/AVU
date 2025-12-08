import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTtlToMessage1710000000008 implements MigrationInterface {
  name = 'AddTtlToMessage1710000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      ADD \`ttl\` int NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
      DROP COLUMN \`ttl\`
    `);
  }
}
