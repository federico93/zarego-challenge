import createEvent from "@serverless/event-mocks";
import { APIGatewayEvent, APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters, Context } from "aws-lambda";

import { LoyaltyCardsController } from "../../../src/controllers/loyaltyCardsController";
import { LoyaltyCardsService } from "../../../src/services/loyaltyCardsService";
import { generateRandomString } from "../../utils/utils";
import { HttpMessage } from "../../../src/controllers/httpMessage";
import { ListLoyaltyCardsDTO, LoyaltyCardDTO } from "../../../src/common/types/dtos";
import { HTTP_CODE_BAD_REQUEST, HTTP_CODE_INTERNAL_SERVER_ERROR, HTTP_CODE_NOT_FOUND, HTTP_CODE_OK } from "../../../src/controllers/httpCode";
import { AlreadyExistsError } from "../../../src/common/errors/alreadyExistsError";
import { NotFoundError } from "../../../src/common/errors/notFoundError";
import { InvalidDataError } from "../../../src/common/errors/invalidDataError";

const serviceMock = jest.createMockFromModule<LoyaltyCardsService>("../../../src/services/loyaltyCardsService");

const controller = new LoyaltyCardsController(serviceMock);

const mockAPIGatewayEvent = (httpMethod: string, path: string, requestBody?: object, pathParameters?: APIGatewayProxyEventPathParameters, queryStringParameters?: APIGatewayProxyEventQueryStringParameters): APIGatewayEvent => {
    return createEvent(
        "aws:apiGateway",
        {
            body: JSON.stringify(requestBody),
            headers: {
                "Content-type": "application/json"
            },
            multiValueHeaders: {},
            httpMethod: httpMethod,
            isBase64Encoded: false,
            path: path,
            pathParameters: pathParameters ?? {},
            queryStringParameters: queryStringParameters ?? null,
            multiValueQueryStringParameters: {},
            stageVariables: {},
            requestContext: {
                accountId: "",
                apiId: "",
                authorizer: undefined,
                protocol: "",
                httpMethod: httpMethod,
                identity: {
                    accessKey: null,
                    accountId: null,
                    apiKey: null,
                    apiKeyId: null,
                    caller: null,
                    clientCert: null,
                    cognitoAuthenticationProvider: null,
                    cognitoAuthenticationType: null,
                    cognitoIdentityId: null,
                    cognitoIdentityPoolId: null,
                    principalOrgId: null,
                    sourceIp: "127.0.0.1",
                    user: null,
                    userAgent: null,
                    userArn: null
                },
                path: path,
                stage: "dev",
                requestId: "",
                requestTimeEpoch: 0,
                resourceId: "",
                resourcePath: ""
            },
            resource: ""
        }
    );
};

const mockContext = (): Context => {
    return {
        callbackWaitsForEmptyEventLoop: false,
        functionName: "",
        functionVersion: "",
        invokedFunctionArn: "",
        memoryLimitInMB: "",
        awsRequestId: "",
        logGroupName: "",
        logStreamName: "",
        getRemainingTimeInMillis: () => 0,
        done: () => {},
        fail: () => {},
        succeed: () => {}
    };
};

describe('Test Loyalty Cards Controller', () => {
    describe('Create loyalty card', () => {
        it('Should create loyalty card', async () => {
            const requestBody = {
                firstName: generateRandomString(),
                lastName: generateRandomString(),
                cardNumber: "1111-2222-3333-4444"
            };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("post", "/loyalty-cards", requestBody);
            const context: Context = mockContext();

            const resultDTO: LoyaltyCardDTO = {
                firstName: requestBody.firstName,
                lastName: requestBody.lastName,
                cardNumber: requestBody.cardNumber,
                points: 0,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            };

            serviceMock.createLoyaltyCard = jest.fn().mockResolvedValue(resultDTO);

            const result: HttpMessage = await controller.createLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_OK,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual(resultDTO);

            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });

        it('Should return bad request invalid data', async () => {
            const requestBody = {
                firstName: generateRandomString(),
                lastName: generateRandomString(),
                cardNumber: "1111-2222-3333-4444"
            };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("post", "/loyalty-cards", requestBody);
            const context: Context = mockContext();

            const errorMessage = "Invalid data";
            serviceMock.createLoyaltyCard = jest.fn().mockRejectedValue(new InvalidDataError(errorMessage));

            const result: HttpMessage = await controller.createLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_BAD_REQUEST,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual({
                message: errorMessage
            });

            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });

        it('Should return bad request already exists', async () => {
            const requestBody = {
                firstName: generateRandomString(),
                lastName: generateRandomString(),
                cardNumber: "1111-2222-3333-4444"
            };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("post", "/loyalty-cards", requestBody);
            const context: Context = mockContext();

            const errorMessage = "Already exists";

            serviceMock.createLoyaltyCard = jest.fn().mockRejectedValue(new AlreadyExistsError(errorMessage));

            const result: HttpMessage = await controller.createLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_BAD_REQUEST,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual({
                message: errorMessage
            });

            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });

        it('Should return internal server error', async () => {
            const requestBody = {
                firstName: generateRandomString(),
                lastName: generateRandomString(),
                cardNumber: "1111-2222-3333-4444"
            };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("post", "/loyalty-cards", requestBody);
            const context: Context = mockContext();

            const errorMessage = "Internal server error";

            serviceMock.createLoyaltyCard = jest.fn().mockRejectedValue(new Error(errorMessage));

            const result: HttpMessage = await controller.createLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_INTERNAL_SERVER_ERROR,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual({
                message: errorMessage
            });

            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.createLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });
    });

    describe('Find loyalty card', () => {
        it('Should find loyalty card', async () => {
            const requestBody = {};
            const pathParameters = { cardNumber: generateRandomString() };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters);
            const context: Context = mockContext();

            const resultDTO: LoyaltyCardDTO = {
                firstName: generateRandomString(),
                lastName: generateRandomString(),
                cardNumber: pathParameters.cardNumber,
                points: 0,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            };

            serviceMock.findLoyaltyCard = jest.fn().mockResolvedValue(resultDTO);

            const result: HttpMessage = await controller.findLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_OK,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual(resultDTO);

            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });

        it('Should return not found', async () => {
            const requestBody = {};
            const pathParameters = { cardNumber: generateRandomString() };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters);
            const context: Context = mockContext();

            const errorMessage = "Not found";
            serviceMock.findLoyaltyCard = jest.fn().mockRejectedValue(new NotFoundError(errorMessage));

            const result: HttpMessage = await controller.findLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_NOT_FOUND,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toMatchObject({
                message: errorMessage
            });

            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });

        it('Should return internal server error', async () => {
            const requestBody = {};
            const pathParameters = { cardNumber: generateRandomString() };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters);
            const context: Context = mockContext();

            const errorMessage = "Internal server error";
            serviceMock.findLoyaltyCard = jest.fn().mockRejectedValue(new Error(errorMessage));

            const result: HttpMessage = await controller.findLoyaltyCard(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_INTERNAL_SERVER_ERROR,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toMatchObject({
                message: errorMessage
            });

            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledTimes(1);
            expect(serviceMock.findLoyaltyCard).toHaveBeenCalledWith(expect.objectContaining(requestBody));
        });
    });

    describe('List loyalty cards', () => {
        it('Should list loyalty cards with limit', async () => {
            const requestBody = {};
            const pathParameters = {};
            const queryStringParameters = { limit: "1" };
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters, queryStringParameters);
            const context: Context = mockContext();

            const resultDTO: ListLoyaltyCardsDTO = {
                loyaltyCards: [
                    {
                        firstName: generateRandomString(),
                        lastName: generateRandomString(),
                        cardNumber: generateRandomString(),
                        points: 0,
                        createdAt: new Date().toISOString(),
                        lastUpdatedAt: new Date().toISOString()
                    }
                ],
                nextToken: null
            };

            serviceMock.listLoyaltyCards = jest.fn().mockResolvedValue(resultDTO);

            const result: HttpMessage = await controller.listLoyaltyCards(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_OK,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual(resultDTO);

            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledTimes(1);
            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledWith(parseInt(queryStringParameters.limit), undefined);
        });

        it('Should list loyalty cards without limit', async () => {
            const requestBody = {};
            const pathParameters = {};
            const queryStringParameters = {};
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters, queryStringParameters);
            const context: Context = mockContext();

            const resultDTO: ListLoyaltyCardsDTO = {
                loyaltyCards: [
                    {
                        firstName: generateRandomString(),
                        lastName: generateRandomString(),
                        cardNumber: generateRandomString(),
                        points: 0,
                        createdAt: new Date().toISOString(),
                        lastUpdatedAt: new Date().toISOString()
                    }
                ],
                nextToken: null
            };

            serviceMock.listLoyaltyCards = jest.fn().mockResolvedValue(resultDTO);

            const result: HttpMessage = await controller.listLoyaltyCards(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_OK,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual(resultDTO);

            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledTimes(1);
            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledWith(50, undefined);
        });

        it('Should return internal server error', async () => {
            const requestBody = {};
            const pathParameters = {};
            const queryStringParameters = {};
    
            const event: APIGatewayEvent = mockAPIGatewayEvent("get", "/loyalty-cards/:cardNumber", requestBody, pathParameters, queryStringParameters);
            const context: Context = mockContext();

            const errorMessage: string = "Internal server error";
            serviceMock.listLoyaltyCards = jest.fn().mockRejectedValue(new Error(errorMessage));

            const result: HttpMessage = await controller.listLoyaltyCards(event, context, () => {});

            expect(result).toMatchObject({
                statusCode: HTTP_CODE_INTERNAL_SERVER_ERROR,
                body: expect.any(String)
            });

            expect(JSON.parse(result.body)).toEqual({
                message: errorMessage
            });

            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledTimes(1);
            expect(serviceMock.listLoyaltyCards).toHaveBeenCalledWith(50, undefined);
        });
    });
})