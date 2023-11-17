import { ParsedCsvRow, parseCsv } from "../../../src/lib/csvParser";

describe('Test Csv Parser', () => {
    it('Should parse csv', () => {
        const csvContent: string = "name,email\njane,janedoe@example.com\njohn,johndoe@example.com";

        const result: ParsedCsvRow[] = parseCsv(csvContent);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            name: "jane",
            email: "janedoe@example.com"
        });
        expect(result[1]).toEqual({
            name: "john",
            email: "johndoe@example.com"
        });
    });
});
