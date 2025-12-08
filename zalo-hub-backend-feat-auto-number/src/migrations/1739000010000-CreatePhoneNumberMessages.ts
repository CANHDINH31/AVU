import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePhoneNumberMessages1739000010000
  implements MigrationInterface
{
  private readonly tableName = 'phone_number_messages';
  private readonly phoneNumberForeignKeyName = 'FK_phone_number_messages_phone';
  private readonly accountForeignKeyName = 'FK_phone_number_messages_account';
  private readonly phoneNumberIndexName = 'IDX_phone_number_messages_phone';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: this.tableName,
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
              isNullable: false,
            },
            {
              name: 'content',
              type: 'text',
              isNullable: false,
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
              isNullable: false,
              default: `'sent'`,
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
    }

    const table = await queryRunner.getTable(this.tableName);

    const hasPhoneNumberForeignKey = table?.foreignKeys.some(
      (fk) => fk.name === this.phoneNumberForeignKeyName,
    );
    if (!hasPhoneNumberForeignKey) {
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          name: this.phoneNumberForeignKeyName,
          columnNames: ['phoneNumberId'],
          referencedTableName: 'phone_numbers',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    const hasAccountForeignKey = table?.foreignKeys.some(
      (fk) => fk.name === this.accountForeignKeyName,
    );
    if (!hasAccountForeignKey) {
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          name: this.accountForeignKeyName,
          columnNames: ['accountId'],
          referencedTableName: 'accounts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    const hasPhoneNumberIndex = table?.indices.some(
      (index) => index.name === this.phoneNumberIndexName,
    );
    if (!hasPhoneNumberIndex) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: this.phoneNumberIndexName,
          columnNames: ['phoneNumberId'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);

    const phoneNumberIndex = table?.indices.find(
      (index) => index.name === this.phoneNumberIndexName,
    );
    if (phoneNumberIndex) {
      await queryRunner.dropIndex(this.tableName, phoneNumberIndex);
    }

    const accountForeignKey = table?.foreignKeys.find(
      (fk) => fk.name === this.accountForeignKeyName,
    );
    if (accountForeignKey) {
      await queryRunner.dropForeignKey(this.tableName, accountForeignKey);
    }

    const phoneNumberForeignKey = table?.foreignKeys.find(
      (fk) => fk.name === this.phoneNumberForeignKeyName,
    );
    if (phoneNumberForeignKey) {
      await queryRunner.dropForeignKey(this.tableName, phoneNumberForeignKey);
    }

    const hasTable = await queryRunner.hasTable(this.tableName);
    if (hasTable) {
      await queryRunner.dropTable(this.tableName);
    }
  }
}
