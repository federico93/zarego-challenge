import { DBHandler } from "./dbHandler";

import { DynamoDBDocumentClient, PutCommand, GetCommand, PutCommandOutput } from "@aws-sdk/lib-dynamodb";

export class DynamoDBHandler implements DBHandler {
    private _docClient: DynamoDBDocumentClient;

    constructor(docClient: DynamoDBDocumentClient) {
        this._docClient = docClient;
    }

    public create = async (tableName: string, dbItem: Object): Promise<boolean> => {
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
}
