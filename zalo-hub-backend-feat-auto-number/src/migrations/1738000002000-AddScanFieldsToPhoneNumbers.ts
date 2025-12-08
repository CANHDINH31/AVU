import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScanFieldsToPhoneNumbers1738000002000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'cover',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'gender',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'dob',
        type: 'bigint',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'sdob',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'globalId',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'bizPkg',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'uid',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'zaloName',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'displayName',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('phone_numbers', 'displayName');
    await queryRunner.dropColumn('phone_numbers', 'zaloName');
    await queryRunner.dropColumn('phone_numbers', 'uid');
    await queryRunner.dropColumn('phone_numbers', 'bizPkg');
    await queryRunner.dropColumn('phone_numbers', 'globalId');
    await queryRunner.dropColumn('phone_numbers', 'sdob');
    await queryRunner.dropColumn('phone_numbers', 'dob');
    await queryRunner.dropColumn('phone_numbers', 'gender');
    await queryRunner.dropColumn('phone_numbers', 'status');
    await queryRunner.dropColumn('phone_numbers', 'cover');
  }
}
