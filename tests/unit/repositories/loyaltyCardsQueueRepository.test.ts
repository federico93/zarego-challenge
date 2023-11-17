import { LoyaltyCard } from "../../../src/common/types/loyaltyCard";
import { QueueHandler } from "../../../src/lib/queues/queueHandler";
import { LoyaltyCardsQueueRepository } from "../../../src/repositories/loyaltyCardsQueueRepository";
import { generateRandomString } from "../../utils/utils";

const queueHandler: QueueHandler = {
    sendBatch: jest.fn().mockResolvedValue(true)
};
const queueUrl = generateRandomString();

const repo = new LoyaltyCardsQueueRepository(queueHandler, queueUrl);

describe('Test Loyalty Cards Queue Repository', () => {
    it('Should enqueue items', () => {
        const loyaltyCards: LoyaltyCard[] = [
            new LoyaltyCard(
                generateRandomString(),
                generateRandomString(),
                generateRandomString()
            )
        ];

        expect(repo.sendBatch(loyaltyCards)).resolves.toBeTruthy();
        expect(queueHandler.sendBatch).toHaveBeenCalledTimes(1);
        expect(queueHandler.sendBatch).toHaveBeenCalledWith(queueUrl, expect.arrayContaining(loyaltyCards.map((card: LoyaltyCard) => {
            return {
                id: card.cardNumber,
                body: card.toJSON()
            }
        })));
    });
});
