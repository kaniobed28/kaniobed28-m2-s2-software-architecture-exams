import { InvalidTagNameException } from '../exceptions/invalid-tag-name.exception';

export class TagName {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new InvalidTagNameException(value);
        }
        this.value = value;
    }

    private isValid(value: string): boolean {
        if (!value || value.length < 2 || value.length > 50) return false;
        // Lowercase, alphanumeric, and hyphens only
        const regex = /^[a-z0-9-]+$/;
        return regex.test(value);
    }

    toString(): string {
        return this.value;
    }

    equals(other: TagName): boolean {
        return this.value === other.value;
    }
}
