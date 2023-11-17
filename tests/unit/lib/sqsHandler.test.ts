import { SQSClient } from "@aws-sdk/client-sqs";

import { SQSHandler } from "../../../src/lib/queues/sqsHandler";
import { QueueEntry } from "../../../src/lib/queues/queueHandler";
import { generateRandomString } from "../../utils/utils";

const sqsClientMock: SQSClient = jest.createMockFromModule<SQSClient>("@aws-sdk/client-sqs");
const sqsHandler: SQSHandler = new SQSHandler(sqsClientMock);

describe('Test SQS Handler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Send batch', () => {
        it('Should send batch', () => {
            sqsClientMock.send = jest.fn().mockResolvedValue({
                Failed: []
            });

            const entries: QueueEntry[] = [
                {
                    id: generateRandomString(),
                    body: generateRandomString()
                }
            ];

            const queueUrl: string = generateRandomString();

            expect(sqsHandler.sendBatch(queueUrl, entries)).resolves.toBeTruthy();

            expect(sqsClientMock.send).toHaveBeenCalledTimes(1);
            expect(sqsClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                input: {
                    QueueUrl: queueUrl,
                    Entries: expect.arrayContaining(entries.map(e => { return { Id: e.id, MessageBody: e.body } }))
                }
            }));
        });
    });
});
