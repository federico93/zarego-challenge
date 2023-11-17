import { FilesHandler } from "../../../src/lib/files/filesHandler";
import { LoyaltyCardsFilesRepository } from "../../../src/repositories/loyaltyCardsFilesRepository";
import { generateRandomString } from "../../utils/utils";

const fakeFileContents: string = generateRandomString();

const filesHandler: FilesHandler = {
    getFileContents: jest.fn().mockResolvedValue(fakeFileContents)
};

const repo = new LoyaltyCardsFilesRepository(filesHandler);

describe('Test Loyalty Cards Files Repository', () => {
    it('Should return file contents', () => {
        const fileKey: string = generateRandomString();
        const bucket: string = generateRandomString();

        expect(repo.getFileContents(fileKey, bucket)).resolves.toEqual(fakeFileContents);
        expect(filesHandler.getFileContents).toHaveBeenCalledTimes(1);
        expect(filesHandler.getFileContents).toHaveBeenCalledWith(fileKey, bucket);
    });
});
