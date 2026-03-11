import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../domain/services/logging.service';

@Injectable()
export class ConsoleLoggingService implements LoggingService {
  public log(...args: any) {
    console.log('LOG: ', args);
  }

  public warn(...args: any) {
    console.warn('WARN: ', args);
  }

  public error(...args: any) {
    console.error('ERROR', args);
  }
}
