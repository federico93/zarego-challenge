export interface CreateLoyaltyCardDTO {
    firstName: string,
    lastName: string,
    cardNumber: string,
    points?: number
};

export interface LoyaltyCardDTO extends CreateLoyaltyCardDTO {
    points: number,
    createdAt: string,
    lastUpdatedAt: string
};

export interface ListLoyaltyCardsDTO {
    loyaltyCards: LoyaltyCardDTO[],
    nextToken: string | null
}
