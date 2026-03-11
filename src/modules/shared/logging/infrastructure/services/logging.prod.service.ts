import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../domain/services/logging.service';

@Injectable()
export class ProdLoggingService extends LoggingService {
  public log(...args: any): void {
    this.write('log', args);
  }

  public warn(...args: any): void {
    this.write('warn', args);
  }

  public error(...args: any): void {
    this.write('error', args);
  }

  private write(level: string, args: any[]): void {
    process.stdout.write(
      JSON.stringify({
        level,
        message: args.join(' '),
        timestamp: new Date().toISOString(),
      }) + '\n',
    );
  }
}
