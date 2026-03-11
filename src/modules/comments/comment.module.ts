import { Module } from '@nestjs/common';
import { AuthModule } from '../shared/auth/auth.module';
import { PostModule } from '../posts/post.module';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { GetCommentsForPostUseCase } from './application/use-cases/get-comments-for-post.use-case';
import { GetCommentCountUseCase } from './application/use-cases/get-comment-count.use-case';
import { CommentRepository } from './domain/repositories/comment.repository';
import { CommentController } from './infrastructure/controllers/comment.controller';
import { SQLiteCommentRepository } from './infrastructure/repositories/comment.sqlite.repository';

@Module({
    imports: [AuthModule, PostModule],
    controllers: [CommentController],
    providers: [
        {
            provide: CommentRepository,
            useClass: SQLiteCommentRepository,
        },
        CreateCommentUseCase,
        DeleteCommentUseCase,
        UpdateCommentUseCase,
        GetCommentsForPostUseCase,
        GetCommentCountUseCase,
    ],
})
export class CommentsModule { }
