import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../shared/logging/domain/services/logging.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  public async execute(id: string, input: UpdateUserDto): Promise<void> {
    this.loggingService.log('UpdateUserUseCase.execute');
    const user = await this.userRepository.getUserById(id);

    if (user) {
      user.update(input.username, input.role);
      await this.userRepository.updateUser(id, user);
    }
  }
}
