import { Module } from '@nestjs/common';
import { LoggingModule } from '../shared/logging/logging.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { UserController } from './infrastructure/controllers/user.controller';
import { SQLiteUserRepository } from './infrastructure/repositories/user.sqlite.repository';

@Module({
  imports: [LoggingModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: SQLiteUserRepository,
    },
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
  ],
  exports: [UserRepository],
})
export class UserModule { }
