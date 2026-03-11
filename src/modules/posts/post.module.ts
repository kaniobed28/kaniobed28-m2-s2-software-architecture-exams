import { Module } from '@nestjs/common';
import { AuthModule } from '../shared/auth/auth.module';
import { LoggingModule } from '../shared/logging/logging.module';
import { TagsModule } from '../tags/tags.module';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { AddTagToPostUseCase } from './application/use-cases/add-tag-to-post.use-case';
import { RemoveTagFromPostUseCase } from './application/use-cases/remove-tag-from-post.use-case';
import { GetPostBySlugUseCase } from './application/use-cases/get-post-by-slug.use-case';
import { UpdatePostSlugUseCase } from './application/use-cases/update-post-slug.use-case';
import { ChangePostStatusUseCase } from './application/use-cases/change-post-status.use-case';
import { PostRepository } from './domain/repositories/post.repository';
import { PostController } from './infrastructure/controllers/post.controller';
import { SQLitePostRepository } from './infrastructure/repositories/post.sqlite.repository';

@Module({
  imports: [AuthModule, LoggingModule, TagsModule],
  controllers: [PostController],
  providers: [
    {
      provide: PostRepository,
      useClass: SQLitePostRepository,
    },

    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    GetPostsUseCase,
    GetPostByIdUseCase,
    AddTagToPostUseCase,
    RemoveTagFromPostUseCase,
    GetPostBySlugUseCase,
    UpdatePostSlugUseCase,
    ChangePostStatusUseCase,
  ],
  exports: [PostRepository],
})
export class PostModule { }
