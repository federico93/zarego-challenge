import { LoyaltyCard } from "../common/types/loyaltyCard";
import { QueueHandler } from "../lib/queues/queueHandler";

export class LoyaltyCardsQueueRepository {
    private _queueHandler: QueueHandler;
    private _queueUrl: any;

    constructor(queueHandler: QueueHandler, queueUrl: any) {
        this._queueHandler = queueHandler;
        this._queueUrl = queueUrl;
    }

    public sendBatch = async (batch: LoyaltyCard[]): Promise<boolean> => {
        return this._queueHandler.sendBatch(this._queueUrl, batch.map((loyaltyCard: LoyaltyCard) => {
            return {
                id: loyaltyCard.cardNumber,
                body: loyaltyCard.toJSON()
            }
        }));
    }
}
