import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  public async execute(): Promise<UserEntity[]> {
    this.loggingService.log('ListUsersUseCase.execute');
    return this.userRepository.listUsers();
  }
}
