import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateAutoMessageLimitTo3001743600000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'daily_scan_tracking',
      'limitAutoMessageToday',
      new TableColumn({
        name: 'limitAutoMessageToday',
        type: 'int',
        default: 300,
        isNullable: false,
        comment: 'Maximum number of automatic messages per day',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'daily_scan_tracking',
      'limitAutoMessageToday',
      new TableColumn({
        name: 'limitAutoMessageToday',
        type: 'int',
        default: 200,
        isNullable: false,
        comment: 'Maximum number of automatic messages per day',
      }),
    );
  }
}
