import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  public async execute(id: string): Promise<void> {
    this.loggingService.log('DeleteUserUseCase.execute');
    await this.userRepository.deleteUser(id);
  }
}
