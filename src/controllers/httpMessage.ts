import { HttpCode } from "./httpCode";

export class HttpMessage {
    public statusCode: HttpCode;
    public body: string;

    constructor(statusCode: HttpCode, body: string) {
        this.statusCode = statusCode;
        this.body = body;
    }

    public static fromStatusCodeAndObjectBody(statusCode: HttpCode, objectBody: object) {
        const body = JSON.stringify(objectBody);

        return new HttpMessage(statusCode, body);
    }

    public static fromStatusCodeAndMessage(statusCode: HttpCode, message: string) {
        const body = JSON.stringify({ message });

        return new HttpMessage(statusCode, body);
    }
}
