import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResponsePayloadToPhoneNumberMessages1743300000000
  implements MigrationInterface
{
  private readonly tableName = 'phone_number_messages';
  private readonly columnName = 'responsePayload';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const hasColumn = table?.columns.some(
      (column) => column.name === this.columnName,
    );

    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`${this.tableName}\`
        ADD COLUMN \`${this.columnName}\` TEXT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const hasColumn = table?.columns.some(
      (column) => column.name === this.columnName,
    );

    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`${this.tableName}\`
        DROP COLUMN \`${this.columnName}\`
      `);
    }
  }
}
