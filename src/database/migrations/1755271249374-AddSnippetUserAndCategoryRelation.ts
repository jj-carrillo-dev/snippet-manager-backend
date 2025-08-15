import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from "typeorm";

export class AddSnippetUserAndCategoryRelation1755271249374 implements MigrationInterface {
    name = 'AddSnippetUserAndCategoryRelation1755271249374';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'snippet',
            new TableColumn({
                name: 'userId',
                type: 'int',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'snippet',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'CASCADE',
            }),
        );
        
        await queryRunner.addColumn(
            'snippet',
            new TableColumn({
                name: 'categoryId',
                type: 'int',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'snippet',
            new TableForeignKey({
                columnNames: ['categoryId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'category',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('snippet');
        if (table) {
            const userForeignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('userId') !== -1,
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey('snippet', userForeignKey);
            }
            await queryRunner.dropColumn('snippet', 'userId');
            
            const categoryForeignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('categoryId') !== -1,
            );
            if (categoryForeignKey) {
                await queryRunner.dropForeignKey('snippet', categoryForeignKey);
            }
            await queryRunner.dropColumn('snippet', 'categoryId');
        }
    }
}