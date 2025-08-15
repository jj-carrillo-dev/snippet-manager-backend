import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from "typeorm";

export class AddCategoryUserRelation1755264181556 implements MigrationInterface {
    name = 'AddCategoryUserRelation1755264181556';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'category',
            new TableColumn({
                name: 'userId',
                type: 'int',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'category',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('category');
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('userId') !== -1,
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey('category', foreignKey);
            }
            await queryRunner.dropColumn('category', 'userId');
        }
    }
}