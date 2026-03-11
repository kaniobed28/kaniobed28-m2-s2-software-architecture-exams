import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogPostCreatedEventHandler } from './application/event-handlers/log-post-created.event-handler';
import { LoggingService } from './domain/services/logging.service';
import { ConsoleLoggingService } from './infrastructure/services/logging.console.service';
import { ProdLoggingService } from './infrastructure/services/logging.prod.service';

@Module({
  providers: [
    {
      provide: LoggingService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV');

        return env === 'development'
          ? new ConsoleLoggingService()
          : new ProdLoggingService();
      },
    },

    LogPostCreatedEventHandler,
  ],
  exports: [LoggingService],
})
export class LoggingModule {}
