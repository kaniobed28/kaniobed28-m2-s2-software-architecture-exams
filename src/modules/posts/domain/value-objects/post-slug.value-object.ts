export class InvalidPostSlugException extends Error {
    constructor(message?: string) {
        super(message || 'Invalid post slug format. Must contain only lowercase letters, numbers, and hyphens.');
        this.name = 'InvalidPostSlugException';
    }
}

export class PostSlug {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new InvalidPostSlugException();
        }
        this.value = value;
    }

    private isValid(value: string): boolean {
        const regex = /^[a-z0-9-]+$/;
        return regex.test(value);
    }

    public toString(): string {
        return this.value;
    }

    public static generateFromTitle(title: string): PostSlug {
        let normalized = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!normalized) {
            normalized = 'post';
        }
        return new PostSlug(normalized);
    }
}
