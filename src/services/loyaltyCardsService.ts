import { ListLoyaltyCardsResult, LoyaltyCardsDBRepository } from "../repositories/loyaltyCardsDBRepository";
import { CreateLoyaltyCardDTO, ListLoyaltyCardsDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { LoyaltyCard } from "../common/types/loyaltyCard";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";
import { NotFoundError } from "../common/errors/notFoundError";

export class LoyaltyCardsService {
    private _dbRepo: LoyaltyCardsDBRepository;

    constructor(loyaltyCardsDBRepository: LoyaltyCardsDBRepository) {
        this._dbRepo = loyaltyCardsDBRepository;
    }

    public createLoyaltyCard = async (createLoyaltyCardDTO: CreateLoyaltyCardDTO): Promise<LoyaltyCardDTO> => {
        let loyaltyCard: LoyaltyCard | null = await this._dbRepo.getByCardNumber(createLoyaltyCardDTO.cardNumber);

        if (loyaltyCard !== null) {
            console.log("CreateLoyaltyCard Error: loyalty card already exists", loyaltyCard);
            throw new AlreadyExistsError("Loyalty card already exists!");
        }

        const currentDate: Date = new Date();

        loyaltyCard = new LoyaltyCard(
            createLoyaltyCardDTO.firstName,
            createLoyaltyCardDTO.lastName,
            createLoyaltyCardDTO.cardNumber,
            createLoyaltyCardDTO.points ?? 0,
            currentDate,
            currentDate
        );

        await this._dbRepo.create(loyaltyCard);

        const createdLoyaltyCard = await this._dbRepo.getByCardNumber(createLoyaltyCardDTO.cardNumber);

        const loyaltyCardDTO: LoyaltyCardDTO = {
            firstName: createdLoyaltyCard.firstName,
            lastName: createdLoyaltyCard.lastName,
            cardNumber: createdLoyaltyCard.cardNumber,
            points: createdLoyaltyCard.points,
            createdAt: createdLoyaltyCard.createdAt.toISOString(),
            lastUpdatedAt: createdLoyaltyCard.lastUpdatedAt.toISOString()
        };

        return loyaltyCardDTO;
    }

    public findLoyaltyCard = async (cardNumber: string): Promise<LoyaltyCardDTO> => {
        const loyaltyCard: LoyaltyCard | null = await this._dbRepo.getByCardNumber(cardNumber);

        if (loyaltyCard === null) {
            console.log(`FindLoyaltyCard Error: loyalty card with number ${cardNumber} not found`);
            throw new NotFoundError(`Loyalty card with number ${cardNumber} not found`);
        }

        const loyaltyCardDTO: LoyaltyCardDTO = {
            firstName: loyaltyCard.firstName,
            lastName: loyaltyCard.lastName,
            cardNumber: loyaltyCard.cardNumber,
            points: loyaltyCard.points,
            createdAt: loyaltyCard.createdAt.toISOString(),
            lastUpdatedAt: loyaltyCard.lastUpdatedAt.toISOString()
        };

        return loyaltyCardDTO;
    }

    public listLoyaltyCards = async (limit: number, nextToken: string): Promise<ListLoyaltyCardsDTO> => {
        const listResult: ListLoyaltyCardsResult = await this._dbRepo.list(limit, nextToken);

        return {
            loyaltyCards: listResult.loyaltyCards.map((loyaltyCard): LoyaltyCardDTO => {
                return {
                    firstName: loyaltyCard.firstName,
                    lastName: loyaltyCard.lastName,
                    cardNumber: loyaltyCard.cardNumber,
                    points: loyaltyCard.points,
                    createdAt: loyaltyCard.createdAt.toISOString(),
                    lastUpdatedAt: loyaltyCard.lastUpdatedAt.toISOString()
                }
            }),
            nextToken: listResult.nextToken
        };
    }
};
