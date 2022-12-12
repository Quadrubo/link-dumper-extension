export class StorageKeyError extends Error {
    constructor(message, type) {
        super(message);
        this.name = "StorageKeyError";
        this.type = type;
    }
}