import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateDailyScanTrackingTables1742000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_scan_tracking table
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
          },
          {
            name: 'scanDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'totalScanned',
            type: 'int',
            default: 0,
          },
          {
            name: 'withInfo',
            type: 'int',
            default: 0,
          },
          {
            name: 'withoutInfo',
            type: 'int',
            default: 0,
          },
          {
            name: 'maxScansPerDay',
            type: 'int',
            default: 280,
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
      true,
    );

    // Create daily_scan_details table
    await queryRunner.createTable(
      new Table({
        name: 'daily_scan_details',
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
          },
          {
            name: 'trackingId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'phoneNumberId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'phoneNumberStr',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'hasInfo',
            type: 'tinyint',
            default: 0,
          },
          {
            name: 'scannedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign keys
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

    await queryRunner.createForeignKey(
      'daily_scan_details',
      new TableForeignKey({
        columnNames: ['phoneNumberId'],
        referencedTableName: 'phone_numbers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'daily_scan_tracking',
      new TableIndex({
        name: 'IDX_daily_scan_tracking_accountId_scanDate',
        columnNames: ['accountId', 'scanDate'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'daily_scan_details',
      new TableIndex({
        name: 'IDX_daily_scan_details_trackingId_phoneNumberId',
        columnNames: ['trackingId', 'phoneNumberId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'daily_scan_details',
      new TableIndex({
        name: 'IDX_daily_scan_details_accountId_phoneNumberId',
        columnNames: ['accountId', 'phoneNumberId'],
      }),
    );

    await queryRunner.createIndex(
      'daily_scan_details',
      new TableIndex({
        name: 'IDX_daily_scan_details_accountId',
        columnNames: ['accountId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const dailyScanDetailsTable =
      await queryRunner.getTable('daily_scan_details');
    if (dailyScanDetailsTable) {
      const foreignKeys = dailyScanDetailsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('daily_scan_details', foreignKey);
      }
    }

    const dailyScanTrackingTable = await queryRunner.getTable(
      'daily_scan_tracking',
    );
    if (dailyScanTrackingTable) {
      const foreignKeys = dailyScanTrackingTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('daily_scan_tracking', foreignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('daily_scan_details');
    await queryRunner.dropTable('daily_scan_tracking');
  }
}
