import { S3Client, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { FilesHandler } from "./filesHandler";

export class S3Handler implements FilesHandler {
    private _s3Client: S3Client;

    constructor(s3Client: S3Client) {
        this._s3Client = s3Client;
    }

    public getFileContents = async (fileKey: string, bucket: string): Promise<string> => {
        console.log(`S3Handler: getting ${fileKey} contents from ${bucket}`);

        const getObjectResult: GetObjectCommandOutput = await this._s3Client.send(new GetObjectCommand({
            Key: fileKey,
            Bucket: bucket
        }));

        return getObjectResult.Body.transformToString();
    }
}
