import createLoyaltyCardSchema from "./schemas/createLoyaltyCard.json";
import { validate, JSONValidationResult } from "../lib/jsonValidator";
import { ListLoyaltyCardsResult, LoyaltyCardsDBRepository } from "../repositories/loyaltyCardsDBRepository";
import { LoyaltyCardsFilesRepository } from "../repositories/loyaltyCardsFilesRepository";
import { LoyaltyCardsQueueRepository } from "../repositories/loyaltyCardsQueueRepository";
import { CreateLoyaltyCardDTO, ListLoyaltyCardsDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { LoyaltyCard } from "../common/types/loyaltyCard";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";
import { NotFoundError } from "../common/errors/notFoundError";
import { parseCsv, ParsedCsvRow } from "../lib/csvParser";
import { InvalidDataError } from "../common/errors/invalidDataError";

interface LoyaltyCardsServiceRepositories {
    db?: LoyaltyCardsDBRepository,
    files?: LoyaltyCardsFilesRepository,
    queue?: LoyaltyCardsQueueRepository
};

export class LoyaltyCardsService {
    private _dbRepo: LoyaltyCardsDBRepository;
    private _filesRepo: LoyaltyCardsFilesRepository;
    private _queueRepo: LoyaltyCardsQueueRepository;

    constructor(repositories: LoyaltyCardsServiceRepositories) {
        this._dbRepo = repositories.db;
        this._filesRepo = repositories.files;
        this._queueRepo = repositories.queue;
    }

    public createLoyaltyCard = async (createLoyaltyCardDTO: CreateLoyaltyCardDTO): Promise<LoyaltyCardDTO> => {
        const validationResult: JSONValidationResult = validate(createLoyaltyCardDTO, createLoyaltyCardSchema);

        if (!validationResult.valid) {
            throw new InvalidDataError(validationResult.errorMessage);
        }

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

    public processLoyaltyCardsFile = async (fileKey: string, bucket: string): Promise<boolean> => {
        const fileContents: string = await this._filesRepo.getFileContents(fileKey, bucket);

        console.log(`Downloaded file contents, length: ${fileContents.length}`);

        const parsedCsv: ParsedCsvRow[] = parseCsv(fileContents).map(row => {
            return { ...row, ...{ points: parseInt(row.points as string) } }
        });

        console.log(`Service: total rows ${parsedCsv.length}`);


        const loyaltyCards: any[] = parsedCsv.filter((row: ParsedCsvRow) => validate(row, createLoyaltyCardSchema).valid)
            .map((row: ParsedCsvRow) => new LoyaltyCard(
                row.firstName as string,
                row.lastName as string,
                row.cardNumber as string,
                row.points as number
            ));

        console.log(`Service: total loyaltyCards ${loyaltyCards.length}`);

        let results: boolean[] = [];
        while (loyaltyCards.length > 0) {
            results.push(await this._queueRepo.sendBatch(loyaltyCards.splice(0, 1000)));
        }

        console.log('Service: results', results);

        return true;
    }
};
