import { S3Client, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { S3Handler } from "../../../src/lib/files/s3Handler"; 
import { generateRandomString } from "../../utils/utils";

const s3ClientMock: S3Client = jest.createMockFromModule<S3Client>("@aws-sdk/client-s3");
const s3Handler: S3Handler = new S3Handler(s3ClientMock);

describe('Test S3 Handler', () => {
    describe('Get file contents', () => {
        it('Should return file contents', () => {
            const body = generateRandomString();

            s3ClientMock.send = jest.fn().mockResolvedValue({
                Body: {
                    transformToString: () => body
                }
            });

            const fileKey: string = generateRandomString();
            const bucket: string = generateRandomString();


            expect(s3Handler.getFileContents(fileKey, bucket)).resolves.toEqual(body);

            expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
            expect(s3ClientMock.send).toHaveBeenCalledWith(expect.objectContaining({
                input: {
                    Key: fileKey,
                    Bucket: bucket
                }
            }));
        });
    });
});
