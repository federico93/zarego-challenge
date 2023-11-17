import { S3Client } from "@aws-sdk/client-s3";
import { S3Handler } from "./s3Handler";
import { FilesHandler } from "./filesHandler";

const FILES_HANDLER_PROVIDER_S3 = "S3";

export type FilesHandlerProvider = typeof FILES_HANDLER_PROVIDER_S3;

export class FilesHandlerFactory {
    public static getHandler = (provider: FilesHandlerProvider): FilesHandler => {
        if (provider == FILES_HANDLER_PROVIDER_S3) {
            return FilesHandlerFactory.buildS3Handler();
        }

        throw new Error(`Unknown Files Handler Provider: ${provider}`);
    }

    public static buildS3Handler = (): S3Handler => {
        const s3Client: S3Client = new S3Client({
            forcePathStyle: true,
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });

        return new S3Handler(s3Client);
    }
}
