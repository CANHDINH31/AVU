import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddAccountIdToPhoneNumbers1738000004000
  implements MigrationInterface
{
  private readonly tableName = 'phone_numbers';
  private readonly columnName = 'accountId';
  private readonly foreignKeyName = 'FK_phone_numbers_account';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      this.tableName,
      this.columnName,
    );

    if (!hasColumn) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: this.columnName,
          type: 'int',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable(this.tableName);
    const hasForeignKey = table?.foreignKeys.some(
      (fk) => fk.name === this.foreignKeyName,
    );

    if (!hasForeignKey) {
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          name: this.foreignKeyName,
          columnNames: [this.columnName],
          referencedTableName: 'accounts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.name === this.foreignKeyName,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
    }

    const hasColumn = await queryRunner.hasColumn(
      this.tableName,
      this.columnName,
    );

    if (hasColumn) {
      await queryRunner.dropColumn(this.tableName, this.columnName);
    }
  }
}
