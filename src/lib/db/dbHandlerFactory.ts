import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { DynamoDBHandler } from "./dynamoDBHandler";
import { DBHandler } from "./dbHandler";

const DB_HANDLER_PROVIDER_DYNAMO_DB = "DYNAMO_DB";

export type DBHandlerProvider = typeof DB_HANDLER_PROVIDER_DYNAMO_DB;

export class DBHandlerFactory {
    public static getHandler = (provider: DBHandlerProvider): DBHandler => {
        if (provider == DB_HANDLER_PROVIDER_DYNAMO_DB) {
            return DBHandlerFactory.buildDynamoDBHandler();
        }

        throw new Error("Unknown DB Handler Provider!");
    }

    public static buildDynamoDBHandler = (): DynamoDBHandler => {
        const dynamodb = new DynamoDBClient({
            region: process.env.AWS_REGION,
            endpoint: process.env.DYNAMO_DB_ENDPOINT,
            credentials: {
                accessKeyId: process.env.DYNAMO_DB_ACCESS_KEY,
                secretAccessKey: process.env.DYNAMO_DB_SECRET_KEY
            },
        });

        const docClient = DynamoDBDocumentClient.from(dynamodb);

        return new DynamoDBHandler(docClient);
    }
}
