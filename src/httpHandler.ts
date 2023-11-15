import { LoyaltyCardsController } from "./controllers/loyaltyCardsController";
import { LoyaltyCardsService } from "./services/loyaltyCardsService";
import { LoyaltyCardsRepository } from "./repositories/loyaltyCardsRepository";
import { DBHandlerFactory, DBHandlerProvider } from "./lib/db/dbHandlerFactory";
import { DBHandler } from "./lib/db/dbHandler";

const dbHandler: DBHandler = DBHandlerFactory.getHandler(process.env.DB_HANDLER_PROVIDER as DBHandlerProvider);

const loyaltyCardsRepository: LoyaltyCardsRepository = new LoyaltyCardsRepository(dbHandler);
const loyaltyCardsService: LoyaltyCardsService = new LoyaltyCardsService(loyaltyCardsRepository);
const loyaltyCardsController: LoyaltyCardsController = new LoyaltyCardsController(loyaltyCardsService);

export const createLoyaltyCard = loyaltyCardsController.createLoyaltyCard;
