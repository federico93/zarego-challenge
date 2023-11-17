import { SQSClient } from "@aws-sdk/client-sqs";
import { QueueHandler } from "./queueHandler";
import { SQSHandler } from "./sqsHandler";

const QUEUE_HANDLER_PROVIDER_SQS = "SQS";

export type QueueHandlerProvider = typeof QUEUE_HANDLER_PROVIDER_SQS;

export class QueueHandlerFactory {
    public static getHandler(provider: QueueHandlerProvider): QueueHandler {
        if (provider == QUEUE_HANDLER_PROVIDER_SQS) {
            return QueueHandlerFactory.buildSQSHandler();
        }

        throw new Error("Unknown Queue Handler Provider!");
    }

    public static buildSQSHandler = (): SQSHandler => {
        const sqsClient: SQSClient = new SQSClient({
            endpoint: process.env.SQS_ENDPOINT,
            credentials: {
                accessKeyId: process.env.SQS_ACCESS_KEY,
                secretAccessKey: process.env.SQS_SECRET_KEY 
            }
        });

        return new SQSHandler(sqsClient);
    }
}
