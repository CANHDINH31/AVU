import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplyToMessage1710000000006 implements MigrationInterface {
  name = 'AddReplyToMessage1710000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        ADD \`reply_to_id\` int NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        ADD CONSTRAINT \`FK_reply_to_id_message\`
        FOREIGN KEY (\`reply_to_id\`) REFERENCES \`messages\`(\`id\`)
        ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        DROP FOREIGN KEY \`FK_reply_to_id_message\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`messages\`
        DROP COLUMN \`reply_to_id\`
    `);
  }
}
