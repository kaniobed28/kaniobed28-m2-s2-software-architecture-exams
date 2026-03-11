import { Module } from '@nestjs/common';
import { AuthModule } from '../shared/auth/auth.module';
import { UserModule } from '../users/user.module';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { GetFollowersUseCase } from './application/use-cases/get-followers.use-case';
import { GetFollowingUseCase } from './application/use-cases/get-following.use-case';
import { FollowRepository } from './domain/repositories/follow.repository';
import { FollowController } from './infrastructure/controllers/follow.controller';
import { SQLiteFollowRepository } from './infrastructure/repositories/follow.sqlite.repository';

@Module({
    imports: [AuthModule, UserModule],
    controllers: [FollowController],
    providers: [
        {
            provide: FollowRepository,
            useClass: SQLiteFollowRepository,
        },
        FollowUserUseCase,
        UnfollowUserUseCase,
        GetFollowersUseCase,
        GetFollowingUseCase,
    ],
    exports: [FollowRepository],
})
export class SubscriptionsModule { }
