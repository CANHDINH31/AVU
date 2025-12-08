import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyAndContentJsonToMessage17100000000077
  implements MigrationInterface
{
  name = 'AddPropertyAndContentJsonToMessage1710000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        ADD \`property_ext_json\` TEXT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        ADD \`content_json\` TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        DROP COLUMN \`content_json\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        DROP COLUMN \`property_ext_json\`
    `);
  }
}
