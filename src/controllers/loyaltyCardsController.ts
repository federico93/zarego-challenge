import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../common/dtos";
import { LoyaltyCardsService } from "../services/loyaltyCardsService";

export class LoyaltyCardsController {
    private _service: LoyaltyCardsService;

    constructor(service: LoyaltyCardsService) {
        this._service = service;
    }

    public createLoyaltyCard: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
        const createLoyaltyCardDTO: CreateLoyaltyCardDTO = JSON.parse(event.body);

        try {
            const resultDTO: LoyaltyCardDTO = await this._service.createLoyaltyCard(createLoyaltyCardDTO);

            callback(null, resultDTO);
        } catch (err) {
            callback(err);
        }
    }
};
