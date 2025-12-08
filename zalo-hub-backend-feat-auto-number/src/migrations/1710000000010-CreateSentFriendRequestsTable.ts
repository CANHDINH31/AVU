import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSentFriendRequestsTable1710000000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sent_friend_requests',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'accountId',
            type: 'int',
          },
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'zaloName',
            type: 'varchar',
          },
          {
            name: 'displayName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'globalId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bizPkg',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fReqInfo',
            type: 'varchar',
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
    );

    await queryRunner.createForeignKey(
      'sent_friend_requests',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('sent_friend_requests');

    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('accountId'),
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('sent_friend_requests', foreignKey);
      }
    }

    await queryRunner.dropTable('sent_friend_requests');
  }
}
