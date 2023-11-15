export interface DBHandler {
    create: (tableName: string, dbItem: Object) => Promise<any>,
    getByPrimaryKey: (tableName: string, pkField: string, pkValue: string) => Promise<any>
};
