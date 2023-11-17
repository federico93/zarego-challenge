import { SQSClient, SendMessageBatchCommandOutput, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { QueueEntry, QueueHandler } from "./queueHandler";

export class SQSHandler implements QueueHandler {
    private _sqsClient: SQSClient;

    constructor(sqsClient: SQSClient) {
        this._sqsClient = sqsClient;
    }

    public sendBatch = async (queueUrl: string, entries: QueueEntry[]): Promise<boolean> => {
        const result: SendMessageBatchCommandOutput = await this._sqsClient.send(new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: entries.map((entry) => {
                return {
                    Id: entry.id,
                    MessageBody: entry.body
                }
            })
        }));

        return result.Failed.length == 0;
    }
}
