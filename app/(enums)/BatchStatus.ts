export enum BatchStatus {
    DISABLE = 0,
    ACTIVE = 1,
    DELETED = 2
}

export namespace BatchStatus {
    export function status(batchStatus: BatchStatus): number {
        return batchStatus;
    }
}