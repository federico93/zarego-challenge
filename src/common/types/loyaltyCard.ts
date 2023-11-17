export class LoyaltyCard {
    private _firstName: string;
    private _lastName: string;
    private _cardNumber: string;
    private _points: number;
    private _createdAt: Date;
    private _lastUpdatedAt: Date;

    constructor(firstName: string, lastName: string, cardNumber: string, points?: number, createdAt?: Date, lastUpdatedAt?: Date) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._cardNumber = cardNumber;
        this._points = points;
        this._createdAt = createdAt;
        this._lastUpdatedAt = lastUpdatedAt;
    }

    public get firstName(): string {
        return this._firstName;
    }

    public set firstName(value: string) {
        this._firstName = value;
    }

    public get lastName(): string {
        return this._lastName;
    }

    public set lastName(value: string) {
        this._lastName = value;
    }

    public get cardNumber(): string {
        return this._cardNumber;
    }

    public set cardNumber(value: string) {
        this._cardNumber = value;
    }

    public get points(): number {
        return this._points;
    }

    public set points(value: number) {
        this._points = value;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public set createdAt(value: Date) {
        this._createdAt = value;
    }

    public get lastUpdatedAt(): Date {
        return this._lastUpdatedAt;
    }

    public set lastUpdatedAt(value: Date) {
        this._lastUpdatedAt = value;
    }

    public toJSON(): string {
        return JSON.stringify({
            cardNumber: this.cardNumber,
            firstName: this.firstName,
            lastName: this.lastName,
            points: this.points,
            createdAt: this.createdAt?.toISOString(),
            lastUpdatedAt: this.lastUpdatedAt?.toISOString()
        });
    }
}
