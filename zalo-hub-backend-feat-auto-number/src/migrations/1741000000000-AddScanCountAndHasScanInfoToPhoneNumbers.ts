import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScanCountAndHasScanInfoToPhoneNumbers1741000000000
  implements MigrationInterface
{
  private readonly tableName = 'phone_numbers';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, [
      new TableColumn({
        name: 'scanCount',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'hasScanInfo',
        type: 'tinyint',
        isNullable: false,
        default: 0,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'hasScanInfo');
    await queryRunner.dropColumn(this.tableName, 'scanCount');
  }
}
