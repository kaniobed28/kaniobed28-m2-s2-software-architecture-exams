import { Inject, Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostRepository } from '../../domain/repositories/post.repository';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../../tags/domain/repositories/tag.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class AddTagToPostUseCase {
    constructor(
        private readonly postRepository: PostRepository,
        @Inject(TAG_REPOSITORY_TOKEN) private readonly tagRepository: TagRepository,
    ) { }

    async execute(postId: string, tagId: string, currentUser: UserEntity): Promise<PostEntity> {
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
            throw new ForbiddenException('Only the post author or an admin can modify tags for this post.');
        }

        const tag = await this.tagRepository.findById(tagId);
        if (!tag) {
            throw new NotFoundException(`Tag with id ${tagId} not found`);
        }

        if (post.tags.some(t => t.id === tag.id)) {
            throw new ConflictException(`Tag is already associated with this post`);
        }

        post.addTag({ id: tag.id, name: tag.name });
        await this.postRepository.updatePost(post.id, post);

        return post;
    }
}
