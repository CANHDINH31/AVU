import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePhoneNumbersTable1738000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create phone_numbers table
    await queryRunner.createTable(
      new Table({
        name: 'phone_numbers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hasSentFriendRequest',
            type: 'tinyint',
            default: 0,
            comment: '0: not sent, 1: sent',
          },
          {
            name: 'messagesSent',
            type: 'int',
            default: 0,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
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

    // Create phone_number_messages table
    await queryRunner.createTable(
      new Table({
        name: 'phone_number_messages',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'phoneNumberId',
            type: 'int',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'accountId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'sent'",
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
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

    // Create foreign keys
    await queryRunner.createForeignKey(
      'phone_numbers',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'phone_number_messages',
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
      'phone_numbers',
      new TableIndex({
        name: 'IDX_phone_numbers_phoneNumber',
        columnNames: ['phoneNumber'],
      }),
    );

    await queryRunner.createIndex(
      'phone_numbers',
      new TableIndex({
        name: 'IDX_phone_numbers_userId',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const phoneNumberMessagesTable = await queryRunner.getTable(
      'phone_number_messages',
    );
    if (phoneNumberMessagesTable) {
      const foreignKey = phoneNumberMessagesTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('phoneNumberId'),
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('phone_number_messages', foreignKey);
      }
    }

    const phoneNumbersTable = await queryRunner.getTable('phone_numbers');
    if (phoneNumbersTable) {
      const foreignKey = phoneNumbersTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('userId'),
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('phone_numbers', foreignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('phone_number_messages');
    await queryRunner.dropTable('phone_numbers');
  }
}
