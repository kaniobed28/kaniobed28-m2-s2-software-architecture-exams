import { Controller, Post, Delete, Get, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { Requester } from '../../../shared/auth/infrastructure/decorators/requester.decorator';
import { JwtAuthGuard } from '../../../shared/auth/infrastructure/guards/jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { FollowUserUseCase } from '../../application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '../../application/use-cases/unfollow-user.use-case';
import { GetFollowersUseCase } from '../../application/use-cases/get-followers.use-case';
import { GetFollowingUseCase } from '../../application/use-cases/get-following.use-case';

@Controller('users')
export class FollowController {
    constructor(
        private readonly followUserUseCase: FollowUserUseCase,
        private readonly unfollowUserUseCase: UnfollowUserUseCase,
        private readonly getFollowersUseCase: GetFollowersUseCase,
        private readonly getFollowingUseCase: GetFollowingUseCase,
    ) { }

    @Post(':id/follow')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    public async followUser(
        @Requester() user: UserEntity,
        @Param('id') id: string,
    ) {
        await this.followUserUseCase.execute(user, id);
    }

    @Delete(':id/follow')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    public async unfollowUser(
        @Requester() user: UserEntity,
        @Param('id') id: string,
    ) {
        await this.unfollowUserUseCase.execute(user, id);
    }

    @Get(':id/followers')
    public async getFollowers(
        @Param('id') id: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        const p = page ? parseInt(page, 10) : 1;
        const ps = pageSize ? parseInt(pageSize, 10) : 20;

        const followers = await this.getFollowersUseCase.execute(id, { page: p, pageSize: ps });
        return {
            followers: followers.users.map(u => ({ id: u.id, username: u.username, role: u.role })),
            total: followers.total,
            page: followers.page,
            pageSize: followers.pageSize,
        };
    }

    @Get(':id/following')
    public async getFollowing(
        @Param('id') id: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        const p = page ? parseInt(page, 10) : 1;
        const ps = pageSize ? parseInt(pageSize, 10) : 20;

        const following = await this.getFollowingUseCase.execute(id, { page: p, pageSize: ps });
        return {
            following: following.users.map(u => ({ id: u.id, username: u.username, role: u.role })),
            total: following.total,
            page: following.page,
            pageSize: following.pageSize,
        };
    }
}
