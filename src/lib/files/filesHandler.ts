export interface FilesHandler {
    getFileContents: (fileKey: string, bucket: string) => Promise<string>
};
