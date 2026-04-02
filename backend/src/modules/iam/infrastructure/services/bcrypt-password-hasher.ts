import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
