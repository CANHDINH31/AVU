import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class RestoreDailyScanTrackingColumns1742400000000
  implements MigrationInterface
{
  private async ensureTable(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (table) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'daily_scan_tracking',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'accountId',
            type: 'int',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'dailyScanCount',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'scanEnabled',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'totalScanned',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'withInfo',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'withoutInfo',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'lastScanDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'withInfoDetails',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'withoutInfoDetails',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  private async ensureColumn(
    queryRunner: QueryRunner,
    column: TableColumn,
  ): Promise<void> {
    let table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }
    const exists = table.columns.some((col) => col.name === column.name);
    if (!exists) {
      await queryRunner.addColumn('daily_scan_tracking', column);
      table = await queryRunner.getTable('daily_scan_tracking');
    }
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

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner);

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'dailyScanCount',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'scanEnabled',
        type: 'boolean',
        isNullable: false,
        default: true,
      }),
    );

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'totalScanned',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'withInfo',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'withoutInfo',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    await this.ensureColumn(
      queryRunner,
      new TableColumn({
        name: 'lastScanDate',
        type: 'date',
        isNullable: true,
      }),
    );

    // Add JSON columns (MySQL doesn't support defaults for JSON, so handle manually)
    await this.ensureJsonColumn(queryRunner, 'withInfoDetails');
    await this.ensureJsonColumn(queryRunner, 'withoutInfoDetails');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    const columnsToDrop = [
      'withoutInfoDetails',
      'withInfoDetails',
      'lastScanDate',
      'withoutInfo',
      'withInfo',
      'totalScanned',
      'scanEnabled',
      'dailyScanCount',
    ];

    for (const columnName of columnsToDrop) {
      const exists = table.columns.some((col) => col.name === columnName);
      if (exists) {
        await queryRunner.dropColumn('daily_scan_tracking', columnName);
      }
    }
  }
}
