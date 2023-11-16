import { APIGatewayEvent, Context, Handler } from "aws-lambda";

import createLoyaltyCardSchema from "./schemas/createLoyaltyCard.json";
import { validate, JSONValidationResult } from "../lib/jsonValidator";
import { CreateLoyaltyCardDTO, ListLoyaltyCardsDTO, LoyaltyCardDTO } from "../common/types/dtos";
import { LoyaltyCardsService } from "../services/loyaltyCardsService";
import { HTTP_CODE_BAD_REQUEST, HTTP_CODE_INTERNAL_SERVER_ERROR, HTTP_CODE_NOT_FOUND, HTTP_CODE_OK, HttpCode } from "./httpCode";
import { AlreadyExistsError } from "../common/errors/alreadyExistsError";
import { NotFoundError } from "../common/errors/notFoundError";
import { HttpMessage } from "./httpMessage";

const LIST_DEFAULT_LIMIT = 50;

export class LoyaltyCardsController {
    private _service: LoyaltyCardsService;

    constructor(service: LoyaltyCardsService) {
        this._service = service;
    }

    public createLoyaltyCard: Handler = async (event: APIGatewayEvent, context: Context) => {
        const data = JSON.parse(event.body);
        const validationResult: JSONValidationResult = validate(data, createLoyaltyCardSchema);

        if (!validationResult.valid) {
            return {
                statusCode: HTTP_CODE_BAD_REQUEST,
                body: JSON.stringify({ message: validationResult.errorMessage })
            };
        }

        const createLoyaltyCardDTO: CreateLoyaltyCardDTO = data;

        try {
            const resultDTO: LoyaltyCardDTO = await this._service.createLoyaltyCard(createLoyaltyCardDTO);

            return HttpMessage.fromStatusCodeAndObjectBody(HTTP_CODE_OK, resultDTO);
        } catch (err) {
            let httpCode: HttpCode = HTTP_CODE_INTERNAL_SERVER_ERROR;

            if (err instanceof AlreadyExistsError) {
                httpCode = HTTP_CODE_BAD_REQUEST;
            }

            return HttpMessage.fromStatusCodeAndMessage(httpCode, err.message);
        }
    }

    public findLoyaltyCard: Handler = async (event: APIGatewayEvent, context: Context) => {
        const cardNumber: string = event.pathParameters.cardNumber;

        try {
            const resultDTO: LoyaltyCardDTO = await this._service.findLoyaltyCard(cardNumber);

            return HttpMessage.fromStatusCodeAndObjectBody(HTTP_CODE_OK, resultDTO);
        } catch (err) {
            let httpCode: HttpCode = HTTP_CODE_INTERNAL_SERVER_ERROR;

            if (err instanceof NotFoundError) {
                httpCode = HTTP_CODE_NOT_FOUND;
            }

            return HttpMessage.fromStatusCodeAndMessage(httpCode, err.message);
        }
    }

    public listLoyaltyCards: Handler = async (event: APIGatewayEvent, context: Context) => {
        const nextToken: string = event.queryStringParameters.nextToken;
        const limit: number = event.queryStringParameters.limit ? parseInt(event.queryStringParameters.limit) : LIST_DEFAULT_LIMIT;

        try {
            const resultDTO: ListLoyaltyCardsDTO = await this._service.listLoyaltyCards(limit, nextToken);

            return HttpMessage.fromStatusCodeAndObjectBody(HTTP_CODE_OK, resultDTO);
        } catch (err) {
            let httpCode: HttpCode = HTTP_CODE_INTERNAL_SERVER_ERROR;

            return HttpMessage.fromStatusCodeAndMessage(httpCode, err.message);
        }
    }
};
