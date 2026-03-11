import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(input: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.authRepository.findUserByUsername(input.username);

    if (!user || !user.checkPassword(input.password)) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, ...user.toJSON() };

    return { accessToken: this.jwtService.sign(payload) };
  }
}
