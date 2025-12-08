import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLastScannedAtToPhoneNumbers1738000001000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'lastScannedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('phone_numbers', 'lastScannedAt');
  }
}
