import { ListLoyaltyCardsResult, LoyaltyCardsRepository } from "../repositories/loyaltyCardsRepository";
import { CreateLoyaltyCardDTO, ListLoyaltyCardsDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { LoyaltyCard } from "../common/types/loyaltyCard";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";
import { NotFoundError } from "../common/errors/notFoundError";

export class LoyaltyCardsService {
    private _repo: LoyaltyCardsRepository;

    constructor(loyaltyCardsRepository: LoyaltyCardsRepository) {
        this._repo = loyaltyCardsRepository;
    }

    public createLoyaltyCard = async (createLoyaltyCardDTO: CreateLoyaltyCardDTO): Promise<LoyaltyCardDTO> => {
        let loyaltyCard: LoyaltyCard | null = await this._repo.getByCardNumber(createLoyaltyCardDTO.cardNumber);

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

        await this._repo.create(loyaltyCard);

        const createdLoyaltyCard = await this._repo.getByCardNumber(createLoyaltyCardDTO.cardNumber);

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
        const loyaltyCard: LoyaltyCard | null = await this._repo.getByCardNumber(cardNumber);

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
        const listResult: ListLoyaltyCardsResult = await this._repo.list(limit, nextToken);

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
