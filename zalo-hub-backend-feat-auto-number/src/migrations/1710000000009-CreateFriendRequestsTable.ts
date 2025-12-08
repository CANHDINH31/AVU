import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFriendRequestsTable1710000000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'friend_requests',
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
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'dob',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'recommType',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'recommSrc',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'recommTime',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'recommInfo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bizPkg',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isSeenFriendReq',
            type: 'int',
            default: 0,
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
      'friend_requests',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('friend_requests');

    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('accountId'),
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('friend_requests', foreignKey);
      }
    }

    await queryRunner.dropTable('friend_requests');
  }
}
