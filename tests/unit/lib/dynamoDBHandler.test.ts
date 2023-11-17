import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { generateRandomString } from "../../utils/utils";

import { DynamoDBHandler } from "../../../src/lib/db/dynamoDBHandler";

const docClientMock: DynamoDBDocumentClient = jest.createMockFromModule<DynamoDBDocumentClient>("@aws-sdk/lib-dynamodb");
const dbHandler = new DynamoDBHandler(docClientMock);

const fakeTableName = generateRandomString();
const fakeDBItem = { primaryKey: generateRandomString() };

describe('Test DynamoDB Handler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create object', () => {
        it('Should create object', () => {
            // Mock send put command
            docClientMock.send = jest.fn(async (command: PutCommand) => {
                return {
                    $metadata: { httpStatusCode: 200 }
                };
            });

            expect(dbHandler.create(fakeTableName, fakeDBItem)).resolves.toBeTruthy();

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Item: expect.objectContaining({
                            primaryKey: fakeDBItem.primaryKey
                        }),
                        TableName: fakeTableName
                    })
                })
            }));
        });

        it ('Should throw error', () => {
            // Mock send put command
            docClientMock.send = jest.fn(async (command: PutCommand) => {
                return {
                    $metadata: { httpStatusCode: 500 }
                };
            });

            expect(dbHandler.create(fakeTableName, fakeDBItem)).rejects.toThrow(new Error("Error creating record"));

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Item: expect.objectContaining({
                            primaryKey: fakeDBItem.primaryKey
                        }),
                        TableName: fakeTableName
                    })
                })
            }));
        });
    });
    
    describe('Get object by primary key', () => {
        it('Should find object', () => {
            // Mock send get command
            docClientMock.send = jest.fn(async (command: GetCommand) => {
                return {
                    Item: fakeDBItem
                };
            });
            
            expect(dbHandler.getByPrimaryKey(fakeTableName, "primaryKey", fakeDBItem.primaryKey)).resolves.toEqual(fakeDBItem);

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Key: expect.objectContaining({
                            primaryKey: fakeDBItem.primaryKey
                        }),
                        TableName: fakeTableName
                    })
                })
            }));
        });

        it('Should not find object', () => {
            // Mock send get command
            docClientMock.send = jest.fn(async (command: GetCommand) => {
                return;
            });
            
            expect(dbHandler.getByPrimaryKey(fakeTableName, "primaryKey", fakeDBItem.primaryKey)).resolves.toEqual(null);

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Key: expect.objectContaining({
                            primaryKey: fakeDBItem.primaryKey
                        }),
                        TableName: fakeTableName
                    })
                })
            }));
        })
    });

    describe('Scan objects', () => {
        const limit: number = 20;

        it('Should scan objects no nextToken', () => {
            const fakeLastEvaluatedKey = { someKey: generateRandomString()};
            const expectedNextToken: string = Buffer.from(JSON.stringify(fakeLastEvaluatedKey)).toString('base64');

            // Mock send scan command
            docClientMock.send = jest.fn(async (command: ScanCommand) => {
                return {
                    Items: [fakeDBItem],
                    LastEvaluatedKey: fakeLastEvaluatedKey
                };
            });

            expect(dbHandler.scan(fakeTableName, limit, undefined!)).resolves.toEqual(expect.objectContaining({
                items: expect.arrayContaining([fakeDBItem]),
                nextToken: expectedNextToken
            }));

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Limit: limit,
                        TableName: fakeTableName
                    })
                })
            }));
        });

        it('Should scan objects with nextToken', () => {
            const fakeLastEvaluatedKey = { someKey: generateRandomString()};
            const fakeNextToken: string = Buffer.from(JSON.stringify(fakeLastEvaluatedKey)).toString('base64');

            // Mock send scan command
            docClientMock.send = jest.fn(async (command: ScanCommand) => {
                return {
                    Items: [fakeDBItem]
                };
            });

            expect(dbHandler.scan(fakeTableName, limit, fakeNextToken)).resolves.toEqual(expect.objectContaining({
                items: expect.arrayContaining([fakeDBItem]),
                nextToken: null
            }));

            expect(docClientMock.send).toHaveBeenCalledTimes(1);
            expect(docClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                clientCommand: expect.objectContaining({
                    input: expect.objectContaining({
                        Limit: limit,
                        TableName: fakeTableName,
                        ExclusiveStartKey: expect.objectContaining(fakeLastEvaluatedKey)
                    })
                })
            }));
        });
    });
});
