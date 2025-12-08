import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class UpdateDailyScanTrackingPerDay1742800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    const columnsToDrop = [
      'dailyFriendRequestCount',
      'dailyFriendRequestLimit',
      'dailyUnfriendCount',
      'dailyUnfriendLimit',
      'totalFriendRequestsSent',
    ];

    for (const columnName of columnsToDrop) {
      const column = table.findColumnByName(columnName);
      if (column) {
        await queryRunner.dropColumn('daily_scan_tracking', column);
      }
    }

    // Drop FK on accountId before removing indexes
    const accountForeignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('accountId'),
    );
    if (accountForeignKey) {
      await queryRunner.dropForeignKey(
        'daily_scan_tracking',
        accountForeignKey,
      );
    }

    // Drop existing unique constraints/indexes on accountId
    for (const unique of table.uniques.filter((uq) =>
      uq.columnNames.includes('accountId'),
    )) {
      await queryRunner.dropUniqueConstraint('daily_scan_tracking', unique);
    }

    for (const index of table.indices.filter((idx) =>
      idx.columnNames.includes('accountId'),
    )) {
      await queryRunner.dropIndex('daily_scan_tracking', index);
    }

    const accountColumn = table.findColumnByName('accountId');
    if (accountColumn && accountColumn.isUnique) {
      const newAccountColumn = accountColumn.clone();
      newAccountColumn.isUnique = false;
      await queryRunner.changeColumn(
        'daily_scan_tracking',
        'accountId',
        newAccountColumn,
      );
    }

    const trackingDateColumn = table.findColumnByName('trackingDate');
    if (!trackingDateColumn) {
      // Add column as nullable first (MySQL doesn't support CURRENT_DATE as default for DATE columns)
      await queryRunner.addColumn(
        'daily_scan_tracking',
        new TableColumn({
          name: 'trackingDate',
          type: 'date',
          isNullable: true,
        }),
      );

      // Update existing rows with default value
      await queryRunner.query(
        `UPDATE daily_scan_tracking SET trackingDate = COALESCE(lastScanDate, CURRENT_DATE) WHERE trackingDate IS NULL`,
      );

      // Make column NOT NULL
      await queryRunner.query(
        `ALTER TABLE daily_scan_tracking MODIFY COLUMN trackingDate date NOT NULL`,
      );
    } else {
      // Column exists, ensure all rows have values
      await queryRunner.query(
        `UPDATE daily_scan_tracking SET trackingDate = COALESCE(lastScanDate, CURRENT_DATE) WHERE trackingDate IS NULL`,
      );

      // Ensure it's NOT NULL
      if (trackingDateColumn.isNullable) {
        await queryRunner.query(
          `ALTER TABLE daily_scan_tracking MODIFY COLUMN trackingDate date NOT NULL`,
        );
      }
    }

    await queryRunner.createIndex(
      'daily_scan_tracking',
      new TableIndex({
        name: 'IDX_daily_scan_tracking_accountId_trackingDate',
        columnNames: ['accountId', 'trackingDate'],
        isUnique: true,
      }),
    );

    // Recreate FK to accounts (non-unique column)
    await queryRunner.createForeignKey(
      'daily_scan_tracking',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('daily_scan_tracking');
    if (!table) {
      return;
    }

    const compositeIndex = table.indices.find(
      (idx) =>
        idx.name === 'IDX_daily_scan_tracking_accountId_trackingDate' ||
        (idx.isUnique &&
          idx.columnNames.length === 2 &&
          idx.columnNames.includes('accountId') &&
          idx.columnNames.includes('trackingDate')),
    );
    if (compositeIndex) {
      await queryRunner.dropIndex('daily_scan_tracking', compositeIndex);
    }

    if (table.findColumnByName('trackingDate')) {
      await queryRunner.dropColumn('daily_scan_tracking', 'trackingDate');
    }

    // Drop FK we added in up
    const fkAccount = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('accountId'),
    );
    if (fkAccount) {
      await queryRunner.dropForeignKey('daily_scan_tracking', fkAccount);
    }

    // Re-add removed columns
    await queryRunner.addColumns('daily_scan_tracking', [
      new TableColumn({
        name: 'dailyFriendRequestCount',
        type: 'int',
        default: 0,
      }),
      new TableColumn({
        name: 'dailyFriendRequestLimit',
        type: 'int',
        default: 40,
      }),
      new TableColumn({
        name: 'dailyUnfriendCount',
        type: 'int',
        default: 0,
      }),
      new TableColumn({
        name: 'dailyUnfriendLimit',
        type: 'int',
        default: 40,
      }),
      new TableColumn({
        name: 'totalFriendRequestsSent',
        type: 'int',
        default: 0,
      }),
    ]);

    const accountColumn = table.findColumnByName('accountId');
    if (accountColumn && !accountColumn.isUnique) {
      const newAccountColumn = accountColumn.clone();
      newAccountColumn.isUnique = true;
      await queryRunner.changeColumn(
        'daily_scan_tracking',
        'accountId',
        newAccountColumn,
      );
    }

    await queryRunner.createIndex(
      'daily_scan_tracking',
      new TableIndex({
        name: 'IDX_daily_scan_tracking_accountId_unique',
        columnNames: ['accountId'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'daily_scan_tracking',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }
}
