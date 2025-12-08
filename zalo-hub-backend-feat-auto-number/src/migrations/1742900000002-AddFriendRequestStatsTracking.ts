import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFriendRequestStatsTracking1742900000002
  implements MigrationInterface
{
  name = 'AddFriendRequestStatsTracking1742900000002';

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
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    // Add regular columns with defaults
    const regularColumns = [
      {
        name: 'autoFriendRequestsSentToday',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'autoFriendRequestsCanceledToday',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'autoFriendRequestsSentTotal',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'autoFriendRequestsCanceledTotal',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'manualFriendRequestsSentToday',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'manualFriendRequestsCanceledToday',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'manualFriendRequestsSentTotal',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'manualFriendRequestsCanceledTotal',
        type: 'int',
        isNullable: false,
        default: 0,
      },
      {
        name: 'autoFriendRequestDailyLimit',
        type: 'int',
        isNullable: false,
        default: 40,
      },
    ];

    for (const colDef of regularColumns) {
      if (!table.findColumnByName(colDef.name)) {
        await queryRunner.addColumn(
          'daily_scan_tracking',
          new TableColumn(colDef),
        );
      }
    }

    // Add JSON columns (MySQL doesn't support defaults for JSON, so handle manually)
    await this.ensureJsonColumn(queryRunner, 'autoFriendRequestDetails');
    await this.ensureJsonColumn(queryRunner, 'autoFriendCancelDetails');
    await this.ensureJsonColumn(queryRunner, 'manualFriendRequestDetails');
    await this.ensureJsonColumn(queryRunner, 'manualFriendCancelDetails');

    // Add pendingFriendRequests to accounts
    const accountsTable = await queryRunner.getTable('accounts');
    if (
      accountsTable &&
      !accountsTable.findColumnByName('pendingFriendRequests')
    ) {
      await queryRunner.addColumn(
        'accounts',
        new TableColumn({
          name: 'pendingFriendRequests',
          type: 'int',
          isNullable: false,
          default: 0,
        }),
      );
    }

    await queryRunner.addColumns('phone_numbers', [
      new TableColumn({
        name: 'autoFriendRequestsSent',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'autoFriendRequestsCanceled',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'manualFriendRequestsSent',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'manualFriendRequestsCanceled',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('phone_numbers', [
      'manualFriendRequestsCanceled',
      'manualFriendRequestsSent',
      'autoFriendRequestsCanceled',
      'autoFriendRequestsSent',
    ]);

    await queryRunner.dropColumn('accounts', 'pendingFriendRequests');

    await queryRunner.dropColumns('daily_scan_tracking', [
      'autoFriendRequestDailyLimit',
      'manualFriendCancelDetails',
      'manualFriendRequestDetails',
      'manualFriendRequestsCanceledTotal',
      'manualFriendRequestsSentTotal',
      'manualFriendRequestsCanceledToday',
      'manualFriendRequestsSentToday',
      'autoFriendCancelDetails',
      'autoFriendRequestDetails',
      'autoFriendRequestsCanceledTotal',
      'autoFriendRequestsSentTotal',
      'autoFriendRequestsCanceledToday',
      'autoFriendRequestsSentToday',
    ]);
  }
}
