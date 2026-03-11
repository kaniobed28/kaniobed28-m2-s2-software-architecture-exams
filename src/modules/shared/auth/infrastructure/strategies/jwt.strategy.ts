import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from '../../../../users/domain/entities/user.entity';
import { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authRepository: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'MY SECRET',
    });
  }

  public async validate(payload: any): Promise<UserEntity> {
    console.log(payload);
    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) throw new Error('User not found');
    return user;
  }
}
