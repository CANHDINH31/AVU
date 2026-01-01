import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserRanksAndAddRankToUsers1744100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_ranks table
    await queryRunner.createTable(
      new Table({
        name: 'user_ranks',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Tên rank: kim_cuong, vang, bac, dong',
          },
          {
            name: 'displayName',
            type: 'varchar',
            length: '100',
            comment: 'Tên hiển thị: Kim Cương, Vàng, Bạc, Đồng',
          },
          {
            name: 'maxAccounts',
            type: 'int',
            default: 0,
            comment: 'Số tài khoản tối đa được phép thêm',
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
            comment: 'Thứ tự sắp xếp (1: cao nhất - kim cương, 4: thấp nhất - đồng)',
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

    // Add index on name for faster lookups
    await queryRunner.createIndex(
      'user_ranks',
      new TableIndex({
        name: 'IDX_USER_RANKS_NAME',
        columnNames: ['name'],
      }),
    );

    // Add rankId column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'rankId',
        type: 'int',
        isNullable: true,
        comment: 'ID của rank khách hàng',
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['rankId'],
        referencedTableName: 'user_ranks',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Seed initial rank data
    await queryRunner.query(`
      INSERT INTO user_ranks (name, displayName, maxAccounts, \`order\`, createdAt, updatedAt) VALUES
      ('kim_cuong', 'Kim Cương', 100, 1, NOW(), NOW()),
      ('vang', 'Vàng', 50, 2, NOW(), NOW()),
      ('bac', 'Bạc', 20, 3, NOW(), NOW()),
      ('dong', 'Đồng', 5, 4, NOW(), NOW())
    `);

    // Set default rank (dong) for existing users
    await queryRunner.query(`
      UPDATE users 
      SET rankId = (SELECT id FROM user_ranks WHERE name = 'dong' LIMIT 1)
      WHERE rankId IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key
    const table = await queryRunner.getTable('users');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('rankId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('users', foreignKey);
      }
    }

    // Remove rankId column from users
    await queryRunner.dropColumn('users', 'rankId');

    // Drop user_ranks table
    await queryRunner.dropTable('user_ranks');
  }
}

