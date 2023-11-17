import { parse } from "csv-parse/sync";

export interface ParsedCsvRow {
    [key: string]: string | number
};

export const parseCsv = (fileContents: string, columns: boolean = true,  delimiter: string = ","): ParsedCsvRow[] => {
    return parse(fileContents, { columns, delimiter });
};
