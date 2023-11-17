import { LoyaltyCardsService } from "../../../src/services/loyaltyCardsService";
import { ListLoyaltyCardsResult, LoyaltyCardsDBRepository } from "../../../src/repositories/loyaltyCardsDBRepository";
import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../../../src/common/types/dtos";
import { LoyaltyCard } from "../../../src/common/types/loyaltyCard";
import { generateRandomString } from "../../utils/utils";
import { NotFoundError } from "../../../src/common/errors/notFoundError";
import { AlreadyExistsError } from "../../../src/common/errors/alreadyExistsError";
import { InvalidDataError } from "../../../src/common/errors/invalidDataError";
import { LoyaltyCardsFilesRepository } from "../../../src/repositories/loyaltyCardsFilesRepository";
import { LoyaltyCardsQueueRepository } from "../../../src/repositories/loyaltyCardsQueueRepository";

const dbRepoMock = jest.createMockFromModule<LoyaltyCardsDBRepository>("../../../src/repositories/loyaltyCardsDBRepository");
const filesRepoMock = jest.createMockFromModule<LoyaltyCardsFilesRepository>("../../../src/repositories/loyaltyCardsFilesRepository");
const queueRepoMock = jest.createMockFromModule<LoyaltyCardsQueueRepository>("../../../src/repositories/loyaltyCardsQueueRepository");

const fakeLoyaltyCard: LoyaltyCard = new LoyaltyCard(
    generateRandomString(), // firstName
    generateRandomString(), // lastName
    "1111-2222-3333-4444", // cardNumber
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

const service = new LoyaltyCardsService({ db: dbRepoMock, files: filesRepoMock, queue: queueRepoMock });

describe('Test Loyalty Cards Service', () => {
    describe('Create loyalty card', () => {
        it('Should create loyalty card with no points', async () => {
            dbRepoMock.create = jest.fn().mockResolvedValue(true);
            dbRepoMock.getByCardNumber = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fakeLoyaltyCard);

            const result: LoyaltyCardDTO = await service.createLoyaltyCard(fakeCreateLoyaltyCardDTO);

            expect(result).toMatchObject({
                firstName: fakeLoyaltyCard.firstName,
                lastName: fakeLoyaltyCard.lastName,
                cardNumber: fakeLoyaltyCard.cardNumber,
                points: 0,
                createdAt: expect.any(String),
                lastUpdatedAt: expect.any(String)
            });

            expect(dbRepoMock.create).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.create).toHaveBeenCalledWith(expect.objectContaining({
                firstName: fakeLoyaltyCard.firstName,
                lastName: fakeLoyaltyCard.lastName,
                cardNumber: fakeLoyaltyCard.cardNumber,
                points: 0,
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date)
            }));

            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(2);
            expect(dbRepoMock.getByCardNumber).toHaveBeenNthCalledWith(1, fakeLoyaltyCard.cardNumber);
            expect(dbRepoMock.getByCardNumber).toHaveBeenNthCalledWith(2, fakeLoyaltyCard.cardNumber);
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

            dbRepoMock.create = jest.fn().mockResolvedValue(true);
            dbRepoMock.getByCardNumber = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fakeLoyaltyCardWithPoints);

            const result: LoyaltyCardDTO = await service.createLoyaltyCard(fakeCreateLoyaltyCardDTOWithPoints);

            expect(result).toMatchObject({
                firstName: fakeLoyaltyCardWithPoints.firstName,
                lastName: fakeLoyaltyCardWithPoints.lastName,
                cardNumber: fakeLoyaltyCardWithPoints.cardNumber,
                points: fakeLoyaltyCardWithPoints.points,
                createdAt: expect.any(String),
                lastUpdatedAt: expect.any(String)
            });

            expect(dbRepoMock.create).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.create).toHaveBeenCalledWith(expect.objectContaining({
                firstName: fakeLoyaltyCardWithPoints.firstName,
                lastName: fakeLoyaltyCardWithPoints.lastName,
                cardNumber: fakeLoyaltyCardWithPoints.cardNumber,
                points: fakeLoyaltyCardWithPoints.points,
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date)
            }));

            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(2);
            expect(dbRepoMock.getByCardNumber).toHaveBeenNthCalledWith(1, fakeLoyaltyCardWithPoints.cardNumber);
            expect(dbRepoMock.getByCardNumber).toHaveBeenNthCalledWith(2, fakeLoyaltyCardWithPoints.cardNumber);
        });

        it('Should not create loyalty card because it already exists', async () => {
            dbRepoMock.create = jest.fn().mockRejectedValue(new Error("Should not be called"));
            dbRepoMock.getByCardNumber = jest.fn().mockResolvedValue(fakeLoyaltyCard);

            expect(service.createLoyaltyCard(fakeCreateLoyaltyCardDTO)).rejects.toThrow(new AlreadyExistsError("Loyalty card already exists!"));

            expect(dbRepoMock.create).toHaveBeenCalledTimes(0);

            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });

        it('Should not create loyalty card because it has invalid data', async () => {
            dbRepoMock.create = jest.fn().mockRejectedValue(new Error("Should not be called"));
            dbRepoMock.getByCardNumber = jest.fn().mockRejectedValue(new Error("Should not be called"));

            const invalidDTO: CreateLoyaltyCardDTO = { ...fakeCreateLoyaltyCardDTO, ...{ cardNumber: generateRandomString() } };

            expect(service.createLoyaltyCard(invalidDTO)).rejects.toThrow(new InvalidDataError('/cardNumber: must match pattern \"^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$\"'));

            expect(dbRepoMock.create).toHaveBeenCalledTimes(0);
            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(0);
        });
    });

    describe('Find loyalty card', () => {
        it('Should find loyalty card', () => {
            dbRepoMock.getByCardNumber = jest.fn(async (cardNumber: string): Promise<LoyaltyCard> => {
                return fakeLoyaltyCard;
            });

            expect(service.findLoyaltyCard(fakeLoyaltyCard.cardNumber)).resolves.toEqual(fakeLoyaltyCardDTO);

            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });

        it('Should not find loyalty card', () => {
            dbRepoMock.getByCardNumber = jest.fn(async (cardNumber: string): Promise<null> => {
                return null;
            });

            expect(service.findLoyaltyCard(fakeLoyaltyCard.cardNumber)).rejects.toThrow(new NotFoundError(`Loyalty card with number ${fakeLoyaltyCard.cardNumber} not found`));

            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.getByCardNumber).toHaveBeenCalledWith(fakeLoyaltyCard.cardNumber);
        });
    });

    describe('List loyalty cards', () => {
        const limit: number = 50;
        const nextToken: string = generateRandomString();

        dbRepoMock.list = jest.fn(async (limit: number, nextToken: string): Promise<ListLoyaltyCardsResult> => {
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

            expect(dbRepoMock.list).toHaveBeenCalledTimes(1);
            expect(dbRepoMock.list).toHaveBeenCalledWith(limit, nextToken);
        });
    });

    describe('Process loyalty cards file', () => {
        it('Should process file', async () => {
            const fakeFileContents: string = "cardNumber,firstName,lastName,points\n7461-1147-4585-9327,Dewitt,Moen-Frami,663\n4047-6393-0563-3246,Magdalena,Marquardt-Luettgen,237";
            filesRepoMock.getFileContents = jest.fn().mockResolvedValue(fakeFileContents);

            queueRepoMock.sendBatch = jest.fn().mockResolvedValue(true);

            const fileKey: string = generateRandomString();
            const bucket: string = generateRandomString();

            const result: boolean = await service.processLoyaltyCardsFile(fileKey, bucket);

            expect(result).toBeTruthy();

            expect(filesRepoMock.getFileContents).toHaveBeenCalledTimes(1);
            expect(filesRepoMock.getFileContents).toHaveBeenCalledWith(fileKey, bucket);

            expect(queueRepoMock.sendBatch).toHaveBeenCalledTimes(1);
            expect(queueRepoMock.sendBatch).toHaveBeenCalledWith(expect.arrayContaining([expect.any(LoyaltyCard), expect.any(LoyaltyCard)]));
        });
    });
});
