import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateDailyLimits1743700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update default value for limitAutoMessageToday from 240 to 160
    await queryRunner.changeColumn(
      'daily_scan_tracking',
      'limitAutoMessageToday',
      new TableColumn({
        name: 'limitAutoMessageToday',
        type: 'int',
        default: 160,
        isNullable: false,
        comment: 'Maximum number of automatic messages per day',
      }),
    );

    // Update existing records that have limitAutoMessageToday = 240 to 160
    await queryRunner.query(`
      UPDATE daily_scan_tracking 
      SET limitAutoMessageToday = 160 
      WHERE limitAutoMessageToday = 240
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert default value for limitAutoMessageToday from 160 back to 240
    await queryRunner.changeColumn(
      'daily_scan_tracking',
      'limitAutoMessageToday',
      new TableColumn({
        name: 'limitAutoMessageToday',
        type: 'int',
        default: 240,
        isNullable: false,
        comment: 'Maximum number of automatic messages per day',
      }),
    );

    // Revert existing records that have limitAutoMessageToday = 160 back to 240
    await queryRunner.query(`
      UPDATE daily_scan_tracking 
      SET limitAutoMessageToday = 240 
      WHERE limitAutoMessageToday = 160
    `);
  }
}
