import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PostCreatedEvent,
  type PostCreatedEventPayload,
} from '../../../../posts/domain/events/post-created.event';
import { LoggingService } from '../../domain/services/logging.service';

@Injectable()
export class LogPostCreatedEventHandler {
  constructor(private readonly loggingService: LoggingService) {}

  @OnEvent(PostCreatedEvent)
  public handle(payload: PostCreatedEventPayload) {
    this.loggingService.log(payload);
  }
}
