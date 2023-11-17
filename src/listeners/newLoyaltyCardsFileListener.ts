import { Handler, S3Event, Context, S3EventRecord } from "aws-lambda";

import { FilesHandlerFactory, FilesHandlerProvider } from "../lib/files/filesHandlerFactory";
import { FilesHandler } from "../lib/files/filesHandler";
import { LoyaltyCardsFilesRepository } from "../repositories/loyaltyCardsFilesRepository";

import { QueueHandler } from "../lib/queues/queueHandler";
import { QueueHandlerFactory, QueueHandlerProvider } from "../lib/queues/queueHandlerFactory";
import { LoyaltyCardsQueueRepository } from "../repositories/loyaltyCardsQueueRepository";

import { LoyaltyCardsService } from "../services/loyaltyCardsService";

const filesHandler: FilesHandler = FilesHandlerFactory.getHandler(process.env.FILES_HANDLER_PROVIDER as FilesHandlerProvider);
const filesRepo: LoyaltyCardsFilesRepository = new LoyaltyCardsFilesRepository(filesHandler);

const queueUrl = process.env.STAGE === "dev" ? process.env.DEV_LOYALTY_CARDS_QUEUE_URL : process.env.LOYALTY_CARDS_QUEUE_URL;
const queueHandler: QueueHandler = QueueHandlerFactory.getHandler(process.env.QUEUE_HANDLER_PROVIDER as QueueHandlerProvider);
const queueRepo: LoyaltyCardsQueueRepository = new LoyaltyCardsQueueRepository(queueHandler, queueUrl);

const service: LoyaltyCardsService = new LoyaltyCardsService({
    files: filesRepo,
    queue: queueRepo
});

export const handler: Handler = async (event: S3Event, context: Context) => {
    const record: S3EventRecord = event.Records[0];
    const fileKey: string = record.s3.object.key;
    const bucket: string = record.s3.bucket.name;

    console.log(`Listener: start processing file ${fileKey} from bucket ${bucket}`);

    try {
        await service.processLoyaltyCardsFile(fileKey, bucket);

        console.log('Listener: finished processing file');
    } catch (err) {
        console.log(`Error processing file ${fileKey} from bucket ${bucket}`, err);
        throw err;
    }
};
