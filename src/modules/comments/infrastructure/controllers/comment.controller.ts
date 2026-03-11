import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Query,
    Patch,
    Post,
    UseGuards,
    HttpCode,
} from '@nestjs/common';
import { Requester } from '../../../shared/auth/infrastructure/decorators/requester.decorator';
import { JwtAuthGuard } from '../../../shared/auth/infrastructure/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../shared/auth/infrastructure/guards/optional-jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { CreateCommentDto } from '../../application/dtos/create-comment.dto';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { GetCommentsForPostUseCase } from '../../application/use-cases/get-comments-for-post.use-case';
import { GetCommentCountUseCase } from '../../application/use-cases/get-comment-count.use-case';
import { UpdateCommentDto } from '../../application/dtos/update-comment.dto';

@Controller('posts')
export class CommentController {
    constructor(
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly deleteCommentUseCase: DeleteCommentUseCase,
        private readonly updateCommentUseCase: UpdateCommentUseCase,
        private readonly getCommentsForPostUseCase: GetCommentsForPostUseCase,
        private readonly getCommentCountUseCase: GetCommentCountUseCase,
    ) { }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard)
    public async getCommentsForPost(
        @Param('id') postId: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt',
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const p = page ? parseInt(page, 10) : 1;
        const ps = pageSize ? parseInt(pageSize, 10) : 20;

        const result = await this.getCommentsForPostUseCase.execute(postId, {
            page: p,
            pageSize: ps,
            sortBy,
            sortOrder,
        });

        return {
            comments: result.comments.map((c) => c.toJSON()),
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
        };
    }

    @Get(':id/comments/count')
    public async getCommentCount(@Param('id') postId: string) {
        return this.getCommentCountUseCase.execute(postId);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    public async addCommentToPost(
        @Requester() user: UserEntity,
        @Param('id') postId: string,
        @Body() input: CreateCommentDto,
    ) {
        const comment = await this.createCommentUseCase.execute(postId, input, user);
        return comment.toJSON();
    }

    @Patch('comments/:id')
    @UseGuards(JwtAuthGuard)
    public async updateComment(
        @Requester() user: UserEntity,
        @Param('id') commentId: string,
        @Body() input: UpdateCommentDto,
    ) {
        const comment = await this.updateCommentUseCase.execute(commentId, input, user);
        return comment.toJSON();
    }

    @Delete('comments/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    public async deleteComment(
        @Requester() user: UserEntity,
        @Param('id') commentId: string,
    ) {
        await this.deleteCommentUseCase.execute(commentId, user);
    }
}
