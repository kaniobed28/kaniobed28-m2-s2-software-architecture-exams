export class InvalidTagNameException extends Error {
    constructor(name: string) {
        super(`Invalid tag name: ${name}. It must be between 2 and 50 characters, lowercase, alphanumeric and may contain hyphens.`);
    }
}
