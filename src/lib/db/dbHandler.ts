export interface DBHandler {
    create: (tableName: string, dbItem: object) => Promise<any>,
    getByPrimaryKey: (tableName: string, pkField: string, pkValue: string) => Promise<any>,
    scan: (tableName: string, limit: number, nextToken: string) => Promise<any>
};
