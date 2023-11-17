import { LoyaltyCard } from "../common/types/loyaltyCard";
import { DBHandler } from "../lib/db/dbHandler";
import { DynamoDBScanResult } from "../lib/db/dynamoDBHandler";

export interface ListLoyaltyCardsResult {
    loyaltyCards: LoyaltyCard[],
    nextToken: string | null
};

export class LoyaltyCardsDBRepository {
    private _db: DBHandler;
    private _tableName: string = process.env.LOYALTY_CARDS_TABLE_NAME;

    constructor(db: DBHandler) {
        this._db = db;
    }

    public create = async (loyaltyCard: LoyaltyCard): Promise<boolean> => {
        const dbItem = {
            firstName: loyaltyCard.firstName,
            lastName: loyaltyCard.lastName,
            cardNumber: loyaltyCard.cardNumber,
            points: loyaltyCard.points,
            createdAt: loyaltyCard.createdAt.toISOString(),
            lastUpdatedAt: loyaltyCard.lastUpdatedAt.toISOString()
        };

        await this._db.create(this._tableName, dbItem);

        return true;
    }

    public getByCardNumber = async (cardNumber: string): Promise<LoyaltyCard | null> => {
        const dbItem = await this._db.getByPrimaryKey(this._tableName, 'cardNumber', cardNumber);

        return dbItem ? new LoyaltyCard(
            dbItem.firstName,
            dbItem.lastName,
            dbItem.cardNumber,
            dbItem.points,
            new Date(dbItem.createdAt),
            new Date(dbItem.lastUpdatedAt)
        ) : null;
    }

    public list = async (limit: number, nextToken: string): Promise<ListLoyaltyCardsResult> => {
        const scanResult: DynamoDBScanResult = await this._db.scan(this._tableName, limit, nextToken);

        return {
            loyaltyCards: scanResult.items.map((dbItem): LoyaltyCard => new LoyaltyCard(
                dbItem.firstName,
                dbItem.lastName,
                dbItem.cardNumber,
                dbItem.points,
                new Date(dbItem.createdAt),
                new Date(dbItem.lastUpdatedAt)
            )),
            nextToken: scanResult.nextToken
        }
    }
}