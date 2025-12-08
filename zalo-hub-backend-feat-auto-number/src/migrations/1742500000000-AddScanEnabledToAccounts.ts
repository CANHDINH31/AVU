import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScanEnabledToAccounts1742500000000
  implements MigrationInterface
{
  private readonly column = new TableColumn({
    name: 'scanEnabled',
    type: 'boolean',
    isNullable: false,
    default: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('accounts');
    if (!table) {
      return;
    }

    const hasColumn = table.columns.some(
      (column) => column.name === this.column.name,
    );

    if (!hasColumn) {
      await queryRunner.addColumn('accounts', this.column);
      await queryRunner.query(
        `UPDATE accounts SET scanEnabled = true WHERE scanEnabled IS NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('accounts');
    if (!table) {
      return;
    }

    const hasColumn = table.columns.some(
      (column) => column.name === this.column.name,
    );

    if (hasColumn) {
      await queryRunner.dropColumn('accounts', this.column);
    }
  }
}

