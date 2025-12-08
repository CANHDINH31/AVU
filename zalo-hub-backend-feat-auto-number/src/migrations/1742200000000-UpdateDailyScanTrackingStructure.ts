import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class UpdateDailyScanTrackingStructure1742200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if tables exist first
    const trackingTable = await queryRunner.getTable('daily_scan_tracking');
    const detailsTable = await queryRunner.getTable('daily_scan_details');

    if (!trackingTable) {
      console.log(
        'Table daily_scan_tracking does not exist, skipping migration',
      );
      return;
    }

    // Check if accountId column exists
    const accountIdColumn = trackingTable.columns.find(
      (col) => col.name === 'accountId',
    );
    if (!accountIdColumn) {
      console.log(
        'Column accountId does not exist in daily_scan_tracking, skipping migration',
      );
      return;
    }

    // First, drop foreign keys that might use the index
    const foreignKeys = trackingTable.foreignKeys.filter((fk) =>
      fk.columnNames.includes('accountId'),
    );
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('daily_scan_tracking', fk);
    }

    // Drop old unique index on daily_scan_tracking
    const oldIndex = trackingTable.indices.find(
      (idx) => idx.name === 'IDX_daily_scan_tracking_accountId_scanDate',
    );
    if (oldIndex) {
      await queryRunner.dropIndex('daily_scan_tracking', oldIndex);
    }

    // Check if scanDate column exists before dropping
    const scanDateColumn = trackingTable.columns.find(
      (col) => col.name === 'scanDate',
    );
    if (scanDateColumn) {
      await queryRunner.dropColumn('daily_scan_tracking', 'scanDate');
    }

    // Recreate foreign key on accountId only
    await queryRunner.createForeignKey(
      'daily_scan_tracking',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add unique index on accountId only (only if it doesn't exist)
    const existingIndex = trackingTable.indices.find(
      (idx) => idx.name === 'IDX_daily_scan_tracking_accountId',
    );
    if (!existingIndex) {
      await queryRunner.createIndex(
        'daily_scan_tracking',
        new TableIndex({
          name: 'IDX_daily_scan_tracking_accountId',
          columnNames: ['accountId'],
          isUnique: true,
        }),
      );
    }

    // Drop old unique index on daily_scan_details
    // First, drop foreign keys that might use the index
    if (!detailsTable) {
      console.log(
        'Table daily_scan_details does not exist, skipping migration',
      );
      return;
    }

    // Find and drop foreign keys on trackingId
    const detailsForeignKeys = detailsTable.foreignKeys.filter((fk) =>
      fk.columnNames.includes('trackingId'),
    );
    for (const fk of detailsForeignKeys) {
      await queryRunner.dropForeignKey('daily_scan_details', fk);
    }

    // Now drop the index
    const detailsOldIndex = detailsTable.indices.find(
      (idx) => idx.name === 'IDX_daily_scan_details_trackingId_phoneNumberId',
    );
    if (detailsOldIndex) {
      await queryRunner.dropIndex('daily_scan_details', detailsOldIndex);
    }

    // Refresh detailsTable to get latest structure
    const refreshedDetailsTable =
      await queryRunner.getTable('daily_scan_details');
    if (!refreshedDetailsTable) {
      console.log('Table daily_scan_details does not exist after refresh');
      return;
    }

    // Check and add accountId column if it doesn't exist
    const accountIdColExists = refreshedDetailsTable.columns.find(
      (col) => col.name === 'accountId',
    );
    if (!accountIdColExists) {
      console.log('Adding accountId column to daily_scan_details...');
      await queryRunner.addColumn(
        'daily_scan_details',
        new TableColumn({
          name: 'accountId',
          type: 'int',
          isNullable: false,
        }),
      );
    }

    // Add scanDate column to daily_scan_details (only if it doesn't exist)
    const scanDateColumnExists = refreshedDetailsTable.columns.find(
      (col) => col.name === 'scanDate',
    );
    if (!scanDateColumnExists) {
      await queryRunner.addColumn(
        'daily_scan_details',
        new TableColumn({
          name: 'scanDate',
          type: 'date',
          isNullable: false,
        }),
      );
    }

    // Refresh again to get latest columns
    const finalDetailsTable = await queryRunner.getTable('daily_scan_details');
    if (!finalDetailsTable) {
      console.log(
        'Table daily_scan_details does not exist after adding columns',
      );
      return;
    }

    // Verify all required columns exist
    const hasAccountId = finalDetailsTable.columns.find(
      (col) => col.name === 'accountId',
    );
    const hasScanDate = finalDetailsTable.columns.find(
      (col) => col.name === 'scanDate',
    );
    const hasPhoneNumberId = finalDetailsTable.columns.find(
      (col) => col.name === 'phoneNumberId',
    );

    if (!hasAccountId || !hasScanDate || !hasPhoneNumberId) {
      console.log(
        'Required columns missing. accountId:',
        !!hasAccountId,
        'scanDate:',
        !!hasScanDate,
        'phoneNumberId:',
        !!hasPhoneNumberId,
      );
      return;
    }

    // Recreate foreign key on trackingId
    await queryRunner.createForeignKey(
      'daily_scan_details',
      new TableForeignKey({
        columnNames: ['trackingId'],
        referencedTableName: 'daily_scan_tracking',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key on accountId if it doesn't exist
    const accountIdFkExists = finalDetailsTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('accountId'),
    );
    if (!accountIdFkExists) {
      await queryRunner.createForeignKey(
        'daily_scan_details',
        new TableForeignKey({
          columnNames: ['accountId'],
          referencedTableName: 'accounts',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        }),
      );
    }

    // Create new unique index on accountId + scanDate + phoneNumberId (only if it doesn't exist)
    const existingIndex1 = finalDetailsTable.indices.find(
      (idx) =>
        idx.name === 'IDX_daily_scan_details_accountId_scanDate_phoneNumberId',
    );
    if (!existingIndex1) {
      await queryRunner.createIndex(
        'daily_scan_details',
        new TableIndex({
          name: 'IDX_daily_scan_details_accountId_scanDate_phoneNumberId',
          columnNames: ['accountId', 'scanDate', 'phoneNumberId'],
          isUnique: true,
        }),
      );
    }

    // Create index on accountId + scanDate for faster queries (only if it doesn't exist)
    const existingIndex2 = finalDetailsTable.indices.find(
      (idx) => idx.name === 'IDX_daily_scan_details_accountId_scanDate',
    );
    if (!existingIndex2) {
      await queryRunner.createIndex(
        'daily_scan_details',
        new TableIndex({
          name: 'IDX_daily_scan_details_accountId_scanDate',
          columnNames: ['accountId', 'scanDate'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new indexes
    const detailsTable = await queryRunner.getTable('daily_scan_details');
    if (detailsTable) {
      const newIndex1 = detailsTable.indices.find(
        (idx) =>
          idx.name ===
          'IDX_daily_scan_details_accountId_scanDate_phoneNumberId',
      );
      if (newIndex1) {
        await queryRunner.dropIndex('daily_scan_details', newIndex1);
      }

      const newIndex2 = detailsTable.indices.find(
        (idx) => idx.name === 'IDX_daily_scan_details_accountId_scanDate',
      );
      if (newIndex2) {
        await queryRunner.dropIndex('daily_scan_details', newIndex2);
      }
    }

    // Drop foreign key on trackingId first
    const detailsTableDown = await queryRunner.getTable('daily_scan_details');
    if (detailsTableDown) {
      const foreignKeys = detailsTableDown.foreignKeys.filter((fk) =>
        fk.columnNames.includes('trackingId'),
      );
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('daily_scan_details', fk);
      }
    }

    // Remove scanDate column from daily_scan_details
    await queryRunner.dropColumn('daily_scan_details', 'scanDate');

    // Restore old unique index on daily_scan_details
    await queryRunner.createIndex(
      'daily_scan_details',
      new TableIndex({
        name: 'IDX_daily_scan_details_trackingId_phoneNumberId',
        columnNames: ['trackingId', 'phoneNumberId'],
        isUnique: true,
      }),
    );

    // Recreate foreign key on trackingId
    await queryRunner.createForeignKey(
      'daily_scan_details',
      new TableForeignKey({
        columnNames: ['trackingId'],
        referencedTableName: 'daily_scan_tracking',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Drop unique index on accountId only
    const trackingTableDown = await queryRunner.getTable('daily_scan_tracking');
    if (trackingTableDown) {
      const accountIdIndex = trackingTableDown.indices.find(
        (idx) => idx.name === 'IDX_daily_scan_tracking_accountId',
      );
      if (accountIdIndex) {
        await queryRunner.dropIndex('daily_scan_tracking', accountIdIndex);
      }

      // Drop foreign key on accountId
      const foreignKeys = trackingTableDown.foreignKeys.filter((fk) =>
        fk.columnNames.includes('accountId'),
      );
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('daily_scan_tracking', fk);
      }
    }

    // Add scanDate column back to daily_scan_tracking
    await queryRunner.addColumn(
      'daily_scan_tracking',
      new TableColumn({
        name: 'scanDate',
        type: 'date',
        isNullable: false,
      }),
    );

    // Restore old unique index on daily_scan_tracking
    await queryRunner.createIndex(
      'daily_scan_tracking',
      new TableIndex({
        name: 'IDX_daily_scan_tracking_accountId_scanDate',
        columnNames: ['accountId', 'scanDate'],
        isUnique: true,
      }),
    );

    // Recreate foreign key on accountId
    await queryRunner.createForeignKey(
      'daily_scan_tracking',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
