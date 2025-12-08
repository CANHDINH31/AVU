import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMessageStatusFlagsToPhoneNumbers1743400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'lastMessageSuccess',
        type: 'tinyint',
        default: 0,
        comment: 'Whether the last message was sent successfully',
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'hasMessageBlockedError',
        type: 'tinyint',
        default: 0,
        comment:
          'Whether this phone number has blocked receiving messages from you',
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'hasStrangerBlockedError',
        type: 'tinyint',
        default: 0,
        comment:
          'Whether this phone number has blocked messages from strangers',
      }),
    );

    await queryRunner.addColumn(
      'phone_numbers',
      new TableColumn({
        name: 'hasNoMsgIdError',
        type: 'tinyint',
        default: 0,
        comment:
          'Whether Zalo returned success but without msgId (message may not be sent)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('phone_numbers', 'hasNoMsgIdError');
    await queryRunner.dropColumn('phone_numbers', 'hasStrangerBlockedError');
    await queryRunner.dropColumn('phone_numbers', 'hasMessageBlockedError');
    await queryRunner.dropColumn('phone_numbers', 'lastMessageSuccess');
  }
}
