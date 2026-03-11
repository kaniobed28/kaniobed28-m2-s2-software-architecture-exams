import { Body, Controller, Post } from '@nestjs/common';
import { LoggingService } from '../../../../shared/logging/domain/services/logging.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loggingService: LoggingService,
  ) {}

  @Post('login')
  public async login(
    @Body() input: LoginDto,
  ): Promise<{ access_token: string }> {
    this.loggingService.log('login');
    const { accessToken } = await this.loginUseCase.execute(input);

    return { access_token: accessToken };
  }
}
