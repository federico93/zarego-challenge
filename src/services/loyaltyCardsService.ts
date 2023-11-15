import { LoyaltyCardsRepository } from "../repositories/loyaltyCardsRepository";
import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../common/dtos";
import { LoyaltyCard } from "../common/types/loyaltyCard";

export class LoyaltyCardsService {
    private _repo: LoyaltyCardsRepository;

    constructor(loyaltyCardsRepository: LoyaltyCardsRepository) {
        this._repo = loyaltyCardsRepository;
    }

    public createLoyaltyCard = async (createLoyaltyCardDTO: CreateLoyaltyCardDTO): Promise<LoyaltyCardDTO> => {
        let loyaltyCard: LoyaltyCard | null = await this._repo.getByCardNumber(createLoyaltyCardDTO.cardNumber);

        if (loyaltyCard !== null) {
            console.log("CreateLoyaltyCard Error: loyalty card already exists", loyaltyCard);
            throw new Error("CreateLoyaltyCard Error: loyalty card already exists");
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

        const result: boolean = await this._repo.create(loyaltyCard);

        if (!result) {
            throw new Error('Couldn\'t create loyalty card');
        }

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
};
