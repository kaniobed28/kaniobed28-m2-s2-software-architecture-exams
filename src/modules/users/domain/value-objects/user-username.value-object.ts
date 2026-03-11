export class UserUsername {
  private value: string;

  constructor(input: string) {
    this.validate(input);
    this.value = input;
  }

  private validate(input: string) {
    if (!input || !input.length) {
      throw new Error('Username cannot be empty');
    }
  }

  public toString() {
    return this.value;
  }
}
