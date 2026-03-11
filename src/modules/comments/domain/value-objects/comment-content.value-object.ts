export class InvalidCommentContentException extends Error {
    constructor(message?: string) {
        super(message || 'Invalid comment content. Must be between 1 and 1000 characters.');
        this.name = 'InvalidCommentContentException';
    }
}

export class CommentContent {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new InvalidCommentContentException();
        }
        this.value = value;
    }

    private isValid(value: string): boolean {
        return value.length > 0 && value.length <= 1000;
    }

    public toString(): string {
        return this.value;
    }
}
