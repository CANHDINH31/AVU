import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateUploadPermissionsTable1735123456789
  implements MigrationInterface
{
  name = 'CreateUploadPermissionsTable1735123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'upload_permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'canRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'canCreate',
            type: 'boolean',
            default: false,
          },
          {
            name: 'canEdit',
            type: 'boolean',
            default: false,
          },
          {
            name: 'canDelete',
            type: 'boolean',
            default: false,
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

    // Tạo unique index cho userId
    await queryRunner.createIndex(
      'upload_permissions',
      new TableIndex({
        name: 'IDX_upload_permissions_userId',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );

    // Tạo foreign key constraint
    await queryRunner.createForeignKey(
      'upload_permissions',
      new TableForeignKey({
        name: 'FK_upload_permissions_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'upload_permissions',
      'FK_upload_permissions_userId',
    );
    await queryRunner.dropIndex(
      'upload_permissions',
      'IDX_upload_permissions_userId',
    );
    await queryRunner.dropTable('upload_permissions');
  }
}
