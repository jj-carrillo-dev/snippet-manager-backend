import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddCategoryUserRelation1755264181556 implements MigrationInterface {
    name = 'AddCategoryUserRelation1755264181556';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add the new column with a nullable constraint
        await queryRunner.addColumn(
            'category',
            new TableColumn({
                name: 'userId',
                type: 'int',
                isNullable: true,
            }),
        );

        // 2. Update existing rows to have a default value
        await queryRunner.query(
            'UPDATE "category" SET "userId" = 1 WHERE "userId" IS NULL',
        );

        // 3. Alter the column to be NOT NULL
        await queryRunner.changeColumn(
            'category',
            'userId',
            new TableColumn({
                name: 'userId',
                type: 'int',
                isNullable: false,
            }),
        );
        
        // 4. Create the foreign key constraint
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
        }
        await queryRunner.dropColumn('category', 'userId');
    }
}