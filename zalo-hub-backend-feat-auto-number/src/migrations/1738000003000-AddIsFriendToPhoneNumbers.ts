import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsFriendToPhoneNumbers1738000003000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'isFriend',
        type: 'tinyint',
        default: 0,
        comment: '0: not friend, 1: is friend',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('phone_numbers', 'isFriend');
  }
}
