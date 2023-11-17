export interface QueueEntry {
    id: string,
    body: string
};

export interface QueueHandler {
    sendBatch: (queueUrl: string, entries: QueueEntry[]) => Promise<boolean>
};
