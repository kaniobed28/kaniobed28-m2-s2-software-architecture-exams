import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLitePostEntity } from '../../posts/infrastructure/entities/post.sqlite.entity';
import { SQLiteUserEntity } from '../../users/infrastructure/entities/user.sqlite.entity';
import { SQLiteTagEntity } from '../../tags/infrastructure/entities/tag.sqlite.entity';
import { SQLiteCommentEntity } from '../../comments/infrastructure/entities/comment.sqlite.entity';
import { SQLiteFollowEntity } from '../../subscriptions/infrastructure/entities/follow.sqlite.entity';
import { SQLiteNotificationEntity } from '../../notifications/infrastructure/entities/notification.sqlite.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_URL'),
        entities: [SQLitePostEntity, SQLiteUserEntity, SQLiteTagEntity, SQLiteCommentEntity, SQLiteFollowEntity, SQLiteNotificationEntity],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule { }
