import { FilesHandler } from "../lib/files/filesHandler";

export class LoyaltyCardsFilesRepository {
    private _files: FilesHandler;

    constructor(files: FilesHandler) {
        this._files = files;
    }

    public getFileContents = async (fileKey: string, bucket: string): Promise<string> => {
        return this._files.getFileContents(fileKey, bucket);
    }
}
