import { LoyaltyCardsController } from "./controllers/loyaltyCardsController";
import { LoyaltyCardsService } from "./services/loyaltyCardsService";
import { LoyaltyCardsDBRepository } from "./repositories/loyaltyCardsDBRepository";
import { DBHandlerFactory, DBHandlerProvider } from "./lib/db/dbHandlerFactory";
import { DBHandler } from "./lib/db/dbHandler";

const dbHandler: DBHandler = DBHandlerFactory.getHandler(process.env.DB_HANDLER_PROVIDER as DBHandlerProvider);

const loyaltyCardsDBRepository: LoyaltyCardsDBRepository = new LoyaltyCardsDBRepository(dbHandler);
const loyaltyCardsService: LoyaltyCardsService = new LoyaltyCardsService({ db: loyaltyCardsDBRepository });
const loyaltyCardsController: LoyaltyCardsController = new LoyaltyCardsController(loyaltyCardsService);

export const createLoyaltyCard = loyaltyCardsController.createLoyaltyCard;
export const findLoyaltyCard = loyaltyCardsController.findLoyaltyCard;
export const listLoyaltyCards = loyaltyCardsController.listLoyaltyCards;
