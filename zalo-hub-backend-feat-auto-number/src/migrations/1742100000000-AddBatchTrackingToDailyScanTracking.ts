import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBatchTrackingToDailyScanTracking1742100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('daily_scan_tracking', [
      new TableColumn({
        name: 'currentBatchIndex',
        type: 'int',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'timeFirst',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeSecond',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeThird',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeFourth',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeFifth',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeSixth',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeSeventh',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('daily_scan_tracking', 'timeSeventh');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeSixth');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeFifth');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeFourth');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeThird');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeSecond');
    await queryRunner.dropColumn('daily_scan_tracking', 'timeFirst');
    await queryRunner.dropColumn('daily_scan_tracking', 'currentBatchIndex');
  }
}
