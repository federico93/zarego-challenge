import { LoyaltyCard } from "../../../src/common/types/loyaltyCard";
import { DBHandler } from "../../../src/lib/db/dbHandler";
import { DynamoDBScanResult } from "../../../src/lib/db/dynamoDBHandler";
import { LoyaltyCardsDBRepository } from "../../../src/repositories/loyaltyCardsDBRepository";
import { generateRandomString } from "../../utils/utils";

const fakeLoyaltyCard: LoyaltyCard = new LoyaltyCard(
    generateRandomString(), // firstName
    generateRandomString(), // lastName
    generateRandomString(), // cardNumber
    200, // points
    new Date(), // createdAt
    new Date() // lastUpdatedAt
);

const fakeDBItem = {
    firstName: fakeLoyaltyCard.firstName,
    lastName: fakeLoyaltyCard.lastName,
    cardNumber: fakeLoyaltyCard.cardNumber,
    points: fakeLoyaltyCard.points,
    createdAt: fakeLoyaltyCard.createdAt.toISOString(),
    lastUpdatedAt: fakeLoyaltyCard.lastUpdatedAt.toISOString()
};

const DBHandlerMock: DBHandler = {
    create: jest.fn(async (tableName: string, dbItem: object): Promise<boolean> => {
        return true;
    }),
    getByPrimaryKey: jest.fn(async (tableName: string, pkField: string, pkValue: string): Promise<object | null> => {
        return fakeDBItem;
    }),
    scan: jest.fn(async (tableName: string, limit: number, nextToken: string): Promise<DynamoDBScanResult> => {
        return {
            items: [fakeDBItem],
            nextToken: null
        };
    })
};

const repo = new LoyaltyCardsDBRepository(DBHandlerMock);

describe('Test Loyalty Cards DB Repository', () => {
    describe('Create loyalty card', () => {
        it('Should create loyalty card', () => {
            expect(repo.create(fakeLoyaltyCard)).resolves.toBeTruthy();

            expect(DBHandlerMock.create).toHaveBeenCalledTimes(1);
            expect(DBHandlerMock.create).toHaveBeenCalledWith(process.env.LOYALTY_CARDS_TABLE_NAME, expect.objectContaining(fakeDBItem));
        });
    });

    describe('Get loyalty card by card number', () => {
        it('Should get loyalty card', () => {
            expect(repo.getByCardNumber(fakeLoyaltyCard.cardNumber)).resolves.toMatchObject(fakeLoyaltyCard);

            expect(DBHandlerMock.getByPrimaryKey).toHaveBeenCalledTimes(1);
            expect(DBHandlerMock.getByPrimaryKey).toHaveBeenCalledWith(
                process.env.LOYALTY_CARDS_TABLE_NAME,
                "cardNumber",
                fakeLoyaltyCard.cardNumber
            );
        });

        it('Should not get loyalty card', () => {
            DBHandlerMock.getByPrimaryKey = jest.fn(async (tableName: string, pkField: string, pkValue: string): Promise<object | null> => {
                return null;
            })

            expect(repo.getByCardNumber(fakeLoyaltyCard.cardNumber)).resolves.toBeNull();

            expect(DBHandlerMock.getByPrimaryKey).toHaveBeenCalledTimes(1);
            expect(DBHandlerMock.getByPrimaryKey).toHaveBeenCalledWith(
                process.env.LOYALTY_CARDS_TABLE_NAME,
                "cardNumber",
                fakeLoyaltyCard.cardNumber
            );
        });
    });

    describe('List loyalty cards', () => {
        it('Should list loyalty cards', () => {
            const limit: number = 50;
            const nextToken: string = generateRandomString();

            expect(repo.list(limit, nextToken)).resolves.toEqual({
                loyaltyCards: expect.arrayContaining([fakeLoyaltyCard]),
                nextToken: null
            });

            expect(DBHandlerMock.scan).toHaveBeenCalledTimes(1);
            expect(DBHandlerMock.scan).toHaveBeenCalledWith(
                process.env.LOYALTY_CARDS_TABLE_NAME,
                limit,
                nextToken
            );
        });
    });
});
