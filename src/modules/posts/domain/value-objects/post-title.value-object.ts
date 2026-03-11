export class PostTitle {
  private readonly value: string;

  constructor(title: string) {
    this.validate(title);
    this.value = title.trim();
  }

  private validate(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (title.length > 200) {
      throw new Error('Title too long (max 200 chars)');
    }

    if (title.length < 3) {
      throw new Error('Title too short (min 3 chars)');
    }
  }

  toString(): string {
    return this.value;
  }

  isValid(): boolean {
    return this.value.length >= 3;
  }
}
