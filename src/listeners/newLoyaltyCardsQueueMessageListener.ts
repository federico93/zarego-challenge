import { Context, Handler, SQSEvent, SQSRecord } from "aws-lambda";

import { LoyaltyCardsDBRepository } from "../repositories/loyaltyCardsDBRepository";
import { DBHandlerFactory, DBHandlerProvider } from "../lib/db/dbHandlerFactory";
import { DBHandler } from "../lib/db/dbHandler";

import { QueueHandler } from "../lib/queues/queueHandler";
import { QueueHandlerFactory, QueueHandlerProvider } from "../lib/queues/queueHandlerFactory";
import { LoyaltyCardsQueueRepository } from "../repositories/loyaltyCardsQueueRepository";

import { LoyaltyCardsService } from "../services/loyaltyCardsService";
import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";

const dbHandler: DBHandler = DBHandlerFactory.getHandler(process.env.DB_HANDLER_PROVIDER as DBHandlerProvider);
const dbRepo: LoyaltyCardsDBRepository = new LoyaltyCardsDBRepository(dbHandler);

const queueUrl = process.env.STAGE === "dev" ? process.env.DEV_LOYALTY_CARDS_QUEUE_URL : process.env.LOYALTY_CARDS_QUEUE_URL;
const queueHandler: QueueHandler = QueueHandlerFactory.getHandler(process.env.QUEUE_HANDLER_PROVIDER as QueueHandlerProvider);
const queueRepo: LoyaltyCardsQueueRepository = new LoyaltyCardsQueueRepository(queueHandler, queueUrl);

const service: LoyaltyCardsService = new LoyaltyCardsService({
    db: dbRepo,
    queue: queueRepo
});

export const handler: Handler = async (event: SQSEvent, context: Context) => {
    await Promise.all(event.Records.map(async (record: SQSRecord) => {
        const createLoyaltyCardDTO: CreateLoyaltyCardDTO = JSON.parse(record.body);

        try {
            const loyaltyCard: LoyaltyCardDTO = await service.createLoyaltyCard(createLoyaltyCardDTO);

            console.log(`Created card ${loyaltyCard.cardNumber}`);
        } catch (err) {
            if (err instanceof AlreadyExistsError) {
                console.log("Listener: already exists, ignoring");
                return;
            }

            console.log('Err', err);

            throw err;
        }
    }));
};
