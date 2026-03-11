import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  public async execute(id: string): Promise<UserEntity | undefined> {
    this.loggingService.log('GetUserByIdUseCase.execute');
    return this.userRepository.getUserById(id);
  }
}
