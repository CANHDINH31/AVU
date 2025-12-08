import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLastMessageSentAtToPhoneNumbers1743600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'lastMessageSentAt',
        type: 'timestamp',
        isNullable: true,
        comment: 'Thời điểm gần nhất đã cố gắng gửi tin nhắn',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('phone_numbers', 'lastMessageSentAt');
  }
}
