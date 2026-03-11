import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggingModule } from '../logging/logging.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthRepository } from './domain/repositories/auth.repository';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { SQLiteAuthRepository } from './infrastructure/repositories/auth.sqlite.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    LoggingModule,
    PassportModule,
    JwtModule.register({
      secret: 'MY SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthRepository,
      useClass: SQLiteAuthRepository,
    },
    LoginUseCase,

    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
