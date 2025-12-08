import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuoteFieldsToMessage1710000000005
  implements MigrationInterface
{
  name = 'AddQuoteFieldsToMessage1710000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\` 
        ADD \`quote_owner_id\` bigint NULL,
        ADD \`quote_cli_msg_id\` bigint NULL,
        ADD \`quote_global_msg_id\` bigint NULL,
        ADD \`quote_cli_msg_type\` int NULL,
        ADD \`quote_ts\` bigint NULL,
        ADD \`quote_msg\` text NULL,
        ADD \`quote_attach\` text NULL,
        ADD \`quote_from_d\` varchar(255) NULL,
        ADD \`quote_ttl\` int NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`messages\` 
        DROP COLUMN \`quote_ttl\`,
        DROP COLUMN \`quote_from_d\`,
        DROP COLUMN \`quote_attach\`,
        DROP COLUMN \`quote_msg\`,
        DROP COLUMN \`quote_ts\`,
        DROP COLUMN \`quote_cli_msg_type\`,
        DROP COLUMN \`quote_global_msg_id\`,
        DROP COLUMN \`quote_cli_msg_id\`,
        DROP COLUMN \`quote_owner_id\`
    `);
  }
}
