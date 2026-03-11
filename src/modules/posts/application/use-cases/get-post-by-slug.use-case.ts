import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostRepository } from '../../domain/repositories/post.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class GetPostBySlugUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(slug: string, user?: UserEntity): Promise<PostEntity> {
        const post = await this.postRepository.getPostBySlug(slug);
        if (!post) {
            throw new NotFoundException(`Post with slug ${slug} not found`);
        }

        if (post.status !== 'accepted') {
            if (!user) {
                throw new ForbiddenException('You do not have permission to view this post');
            }
            if (post.authorId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
                throw new ForbiddenException('You do not have permission to view this post');
            }
        }

        return post;
    }
}
