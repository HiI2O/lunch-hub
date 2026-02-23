export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<string>;
  abstract compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
