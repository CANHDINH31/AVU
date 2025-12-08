import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddManualScanTracking1742900000001 implements MigrationInterface {
  name = 'AddManualScanTracking1742900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    // Add manualScanCount column (regular column with default)
    if (!table.findColumnByName('manualScanCount')) {
      await queryRunner.addColumn(
        'daily_scan_tracking',
        new TableColumn({
          name: 'manualScanCount',
          type: 'int',
          isNullable: false,
          default: 0,
        }),
      );
    }

    // Add JSON columns (MySQL doesn't support defaults for JSON, so handle manually)
    await this.ensureJsonColumn(queryRunner, 'manualWithInfoDetails');
    await this.ensureJsonColumn(queryRunner, 'manualWithoutInfoDetails');
  }

  private async ensureJsonColumn(
    queryRunner: QueryRunner,
    columnName: string,
  ): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }
    const exists = table.columns.some((col) => col.name === columnName);

    if (!exists) {
      // Add column as nullable first (MySQL doesn't support defaults for JSON)
      await queryRunner.addColumn(
        'daily_scan_tracking',
        new TableColumn({
          name: columnName,
          type: 'json',
          isNullable: true,
        }),
      );
      // Update existing rows to have default empty array
      await queryRunner.query(
        `UPDATE daily_scan_tracking SET ${columnName} = '[]' WHERE ${columnName} IS NULL`,
      );
      // Make column NOT NULL
      await queryRunner.query(
        `ALTER TABLE daily_scan_tracking MODIFY COLUMN ${columnName} json NOT NULL`,
      );
    } else {
      // Column exists, but ensure it's NOT NULL and has default values for NULL rows
      const column = table.columns.find((col) => col.name === columnName);
      if (column && column.isNullable) {
        // Update NULL values first
        await queryRunner.query(
          `UPDATE daily_scan_tracking SET ${columnName} = '[]' WHERE ${columnName} IS NULL`,
        );
        // Make it NOT NULL
        await queryRunner.query(
          `ALTER TABLE daily_scan_tracking MODIFY COLUMN ${columnName} json NOT NULL`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('daily_scan_tracking', [
      'manualWithoutInfoDetails',
      'manualWithInfoDetails',
      'manualScanCount',
    ]);
  }
}
