import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { CreateLoyaltyCardDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { LoyaltyCardsService } from "../services/loyaltyCardsService";
import { HTTP_CODE_BAD_REQUEST, HTTP_CODE_INTERNAL_SERVER_ERROR, HTTP_CODE_OK } from "./httpCodes";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";

export class LoyaltyCardsController {
    private _service: LoyaltyCardsService;

    constructor(service: LoyaltyCardsService) {
        this._service = service;
    }

    public createLoyaltyCard: Handler = async (event: APIGatewayEvent, context: Context) => {
        const createLoyaltyCardDTO: CreateLoyaltyCardDTO = JSON.parse(event.body);

        try {
            const resultDTO: LoyaltyCardDTO = await this._service.createLoyaltyCard(createLoyaltyCardDTO);

            return {
                statusCode: HTTP_CODE_OK,
                body: JSON.stringify(resultDTO)
            };
        } catch (err) {
            if (err instanceof AlreadyExistsError) {
                return {
                    statusCode: HTTP_CODE_BAD_REQUEST,
                    body: JSON.stringify({ message: err.message })
                };
            }

            return {
                statusCode: HTTP_CODE_INTERNAL_SERVER_ERROR,
                body: JSON.stringify({ message: err.message })
            };
        }
    }
};
