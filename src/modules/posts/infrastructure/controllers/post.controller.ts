import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { Requester } from '../../../shared/auth/infrastructure/decorators/requester.decorator';
import { JwtAuthGuard } from '../../../shared/auth/infrastructure/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../shared/auth/infrastructure/guards/optional-jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { CreatePostDto } from '../../application/dtos/create-post.dto';
import { UpdatePostDto } from '../../application/dtos/update-post.dto';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { GetPostByIdUseCase } from '../../application/use-cases/get-post-by-id.use-case';
import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { AddTagToPostUseCase } from '../../application/use-cases/add-tag-to-post.use-case';
import { RemoveTagFromPostUseCase } from '../../application/use-cases/remove-tag-from-post.use-case';
import { GetPostBySlugUseCase } from '../../application/use-cases/get-post-by-slug.use-case';
import { UpdatePostSlugUseCase } from '../../application/use-cases/update-post-slug.use-case';
import { ChangePostStatusUseCase } from '../../application/use-cases/change-post-status.use-case';
import type { PostStatus } from '../../domain/entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly getPostsUseCase: GetPostsUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly addTagToPostUseCase: AddTagToPostUseCase,
    private readonly removeTagFromPostUseCase: RemoveTagFromPostUseCase,
    private readonly getPostBySlugUseCase: GetPostBySlugUseCase,
    private readonly updatePostSlugUseCase: UpdatePostSlugUseCase,
    private readonly changePostStatusUseCase: ChangePostStatusUseCase,
  ) { }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  public async getPosts(
    @Requester() user?: UserEntity,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    const posts = await this.getPostsUseCase.execute(tagsArray, user);

    return posts.map((p) => p.toJSON());
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  public async getPostBySlug(
    @Requester() user: UserEntity,
    @Param('slug') slug: string,
  ) {
    const post = await this.getPostBySlugUseCase.execute(slug, user);

    return post?.toJSON();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createPost(
    @Requester() user: UserEntity,
    @Body() input: Omit<CreatePostDto, 'authorId'>,
  ) {
    return this.createPostUseCase.execute(
      { ...input, authorId: user.id },
      user,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  public async updatePost(
    @Param('id') id: string,
    @Body() input: UpdatePostDto,
  ) {
    return this.updatePostUseCase.execute(id, input);
  }

  @Patch(':id/slug')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  public async updatePostSlug(
    @Param('id') id: string,
    @Body('slug') slug: string,
    @Requester() user: UserEntity,
  ) {
    await this.updatePostSlugUseCase.execute(id, slug, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  public async changePostStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Requester() user: UserEntity,
  ) {
    await this.changePostStatusUseCase.execute(id, status as PostStatus, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deletePost(
    @Param('id') id: string,
    @Requester() user: UserEntity,
  ) {
    return this.deletePostUseCase.execute(id, user);
  }

  @Post(':postId/tags/:tagId')
  @UseGuards(JwtAuthGuard)
  public async addTagToPost(
    @Requester() user: UserEntity,
    @Param('postId') postId: string,
    @Param('tagId') tagId: string,
  ) {
    const post = await this.addTagToPostUseCase.execute(postId, tagId, user);
    return post.toJSON();
  }

  @Delete(':postId/tags/:tagId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  public async removeTagFromPost(
    @Requester() user: UserEntity,
    @Param('postId') postId: string,
    @Param('tagId') tagId: string,
  ) {
    await this.removeTagFromPostUseCase.execute(postId, tagId, user);
  }
}
