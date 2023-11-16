import { LoyaltyCardsService } from "../../../src/services/loyaltyCardsService";
import { ListLoyaltyCardsResult, LoyaltyCardsRepository } from "../../../src/repositories/loyaltyCardsRepository";
import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../../../src/common/types/dtos";
import { LoyaltyCard } from "../../../src/common/types/loyaltyCard";
import { generateRandomString } from "../../utils/utils";
import { NotFoundError } from "../../../src/common/errors/notFoundError";
import { AlreadyExistsError } from "../../../src/common/errors/alreadyExistsError";

const repoMock = jest.createMockFromModule<LoyaltyCardsRepository>("../../../src/repositories/loyaltyCardsRepository");

const fakeLoyaltyCard: LoyaltyCard = new LoyaltyCard(
    generateRandomString(), // firstName
    generateRandomString(), // lastName
    generateRandomString(), // cardNumber
    0, // points
    new Date(), // createdAt
    new Date() // lastUpdatedAt
);

const fakeCreateLoyaltyCardDTO: CreateLoyaltyCardDTO = {
    firstName: fakeLoyaltyCard.firstName,
    lastName: fakeLoyaltyCard.lastName,
    cardNumber: fakeLoyaltyCard.cardNumber
}

const fakeLoyaltyCardDTO: LoyaltyCardDTO = {
    firstName: fakeLoyaltyCard.firstName,
    lastName: fakeLoyaltyCard.lastName,
    cardNumber: fakeLoyaltyCard.cardNumber,
    points: fakeLoyaltyCard.points,
    createdAt: fakeLoyaltyCard.createdAt.toISOString(),
    lastUpdatedAt: fakeLoyaltyCard.lastUpdatedAt.toISOString()
};

const service = new LoyaltyCardsService(repoMock);

describe('Test Loyalty Cards Service', () => {
    describe('Create loyalty card', () => {
        it('Should create loyalty card with no points', async () => {
            repoMock.create = jest.fn().mockResolvedValue(true);
            repoMock.getByCardNumber = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fakeLoyaltyCard);

            const result: LoyaltyCardDTO = await service.createLoyaltyCard(fakeCreateLoyaltyCardDTO);

            expect(result).toMatchObject({
                firstName: fakeLoyaltyCard.firstName,
                lastName: fakeLoyaltyCard.lastName,
                cardNumber: fakeLoyaltyCard.cardNumber,
                points: 0,
                createdAt: expect.any(String),
                lastUpdatedAt: expect.any(String)
            });

            expect(repoMock.create).toHaveBeenCalledTimes(1);
            expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining({
                firstName: fakeLoyaltyCard.firstName,
                lastName: fakeLoyaltyCard.lastName,
                cardNumber: fakeLoyaltyCard.cardNumber,
                points: 0,
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date)
            }));

            expect(repoMock.getByCardNumber).toHaveBeenCalledTimes(2);
            expect(repoMock.getByCardNumber).toHaveBeenNthCalledWith(1, fakeLoyaltyCard.cardNumber);
            expect(repoMock.getByCardNumber).toHaveBeenNthCalledWith(2, fakeLoyaltyCard.cardNumber);
        });

        it('Should create loyalty card with specified points', async () => {
            const fakeLoyaltyCardWithPoints = new LoyaltyCard(
                fakeLoyaltyCard.firstName,
                fakeLoyaltyCard.lastName,
                fakeLoyaltyCard.cardNumber,
                200, // points
                fakeLoyaltyCard.createdAt,
                fakeLoyaltyCard.lastUpdatedAt
            );

            const fakeCreateLoyaltyCardDTOWithPoints: CreateLoyaltyCardDTO = {
                firstName: fakeLoyaltyCardWithPoints.firstName,
                lastName: fakeLoyaltyCardWithPoints.lastName,
                cardNumber: fakeLoyaltyCardWithPoints.cardNumber,
                points: fakeLoyaltyCardWithPoints.points
            };

            repoMock.create = jest.fn().mockResolvedValue(true);
            repoMock.getByCardNumber = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fakeLoyaltyCardWithPoints);

            const result: LoyaltyCardDTO = await service.createLoyaltyCard(fakeCreateLoyaltyCardDTOWithPoints);

            expect(result).toMatchObject({
                firstName: fakeLoyaltyCardWithPoints.firstName,
                lastName: fakeLoyaltyCardWithPoints.lastName,
                cardNumber: fakeLoyaltyCardWithPoints.cardNumber,
                points: fakeLoyaltyCardWithPoints.points,
                createdAt: expect.any(String),
                lastUpdatedAt: expect.any(String)
            });

            expect(repoMock.create).toHaveBeenCalledTimes(1);
            expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining({
                firstName: fakeLoyaltyCardWithPoints.firstName,
                lastName: fakeLoyaltyCardWithPoints.lastName,
                cardNumber: fakeLoyaltyCardWithPoints.cardNumber,
                points: fakeLoyaltyCardWithPoints.points,
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date)
            }));

            expect(repoMock.getByCardNumber).toHaveBeenCalledTimes(2);
            expect(repoMock.getByCardNumber).toHaveBeenNthCalledWith(1, fakeLoyaltyCardWithPoints.cardNumber);
            expect(repoMock.getByCardNumber).toHaveBeenNthCalledWith(2, fakeLoyaltyCardWithPoints.cardNumber);
        });

        it('Should not create loyalty card because it already exists', async () => {
            repoMock.create = jest.fn().mockRejectedValue(new Error("Should not be called"));
            repoMock.getByCardNumber = jest.fn().mockResolvedValue(fakeLoyaltyCard);

            expect(service.createLoyaltyCard(fakeCreateLoyaltyCardDTO)).rejects.toThrow(new AlreadyExistsError("Loyalty card already exists!"));

            expect(repoMock.create).toHaveBeenCalledTimes(0);

            expect(repoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(repoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });
    });

    describe('Find loyalty card', () => {
        it('Should find loyalty card', () => {
            repoMock.getByCardNumber = jest.fn(async (cardNumber: string): Promise<LoyaltyCard> => {
                return fakeLoyaltyCard;
            });

            expect(service.findLoyaltyCard(fakeLoyaltyCard.cardNumber)).resolves.toEqual(fakeLoyaltyCardDTO);

            expect(repoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(repoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });

        it('Should not find loyalty card', () => {
            repoMock.getByCardNumber = jest.fn(async (cardNumber: string): Promise<null> => {
                return null;
            });

            expect(service.findLoyaltyCard(fakeLoyaltyCard.cardNumber)).rejects.toThrow(new NotFoundError(`Loyalty card with number ${fakeLoyaltyCard.cardNumber} not found`));

            expect(repoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(repoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });
    });

    describe('List loyalty cards', () => {
        const limit: number = 50;
        const nextToken: string = generateRandomString();

        repoMock.list = jest.fn(async (limit: number, nextToken: string): Promise<ListLoyaltyCardsResult> => {
            return {
                loyaltyCards: [fakeLoyaltyCard],
                nextToken: null
            }
        });

        it('Should list loyalty cards', () => {
            expect(service.listLoyaltyCards(limit, nextToken)).resolves.toEqual({
                loyaltyCards: [fakeLoyaltyCardDTO],
                nextToken: null
            });

            expect(repoMock.list).toHaveBeenCalledTimes(1);
            expect(repoMock.list).toHaveBeenCalledWith(limit, nextToken);
        });
    })
})