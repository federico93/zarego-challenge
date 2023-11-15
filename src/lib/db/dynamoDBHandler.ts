import { DBHandler } from "./dbHandler";

import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export interface DynamoDBQueryResult {
    items: any[],
    nextToken: string | null
};

export class DynamoDBHandler implements DBHandler {
    private _docClient: DynamoDBDocumentClient;

    constructor(docClient: DynamoDBDocumentClient) {
        this._docClient = docClient;
    }

    public create = async (tableName: string, dbItem: object): Promise<boolean> => {
        const command: PutCommand = new PutCommand({
            TableName: tableName,
            Item: dbItem
        });

        const result = await this._docClient.send(command);

        if (result.$metadata.httpStatusCode !== 200) {
            console.log("Error creating record", { tableName, dbItem });
            throw new Error("Error creating record");
        }

        return true;
    }

    public getByPrimaryKey = async (tableName: string, pkField: string, pkValue: string): Promise<object | null> => {
        const command: GetCommand = new GetCommand({
            TableName: tableName,
            Key: { [pkField]: pkValue }
        });

        const result = await this._docClient.send(command);

        return result?.Item ?? null;
    }

    public scan = async (tableName: string, limit: number, nextToken: string): Promise<DynamoDBQueryResult> => {
        const decodedNextToken = nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('ascii')) : undefined;

        const command: ScanCommand = new ScanCommand({
            TableName: tableName,
            ExclusiveStartKey: decodedNextToken,
            Limit: limit
        });

        const result = await this._docClient.send(command);

        return {
            items: result.Items,
            nextToken: result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : null
        };
    }
}
