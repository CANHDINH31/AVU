import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScanEnabledToDailyScanTracking1742300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      console.log(
        'Table daily_scan_tracking does not exist, skipping migration AddScanEnabledToDailyScanTracking',
      );
      return;
    }

    const hasScanEnabledColumn = table.columns.find(
      (column) => column.name === 'scanEnabled',
    );

    if (!hasScanEnabledColumn) {
      await queryRunner.addColumn(
        'daily_scan_tracking',
        new TableColumn({
          name: 'scanEnabled',
          type: 'boolean',
          isNullable: false,
          default: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    const hasScanEnabledColumn = table.columns.find(
      (column) => column.name === 'scanEnabled',
    );

    if (hasScanEnabledColumn) {
      await queryRunner.dropColumn('daily_scan_tracking', 'scanEnabled');
    }
  }
}
