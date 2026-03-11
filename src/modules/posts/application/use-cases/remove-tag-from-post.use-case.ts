import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostRepository } from '../../domain/repositories/post.repository';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../../tags/domain/repositories/tag.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class RemoveTagFromPostUseCase {
    constructor(
        private readonly postRepository: PostRepository,
        @Inject(TAG_REPOSITORY_TOKEN) private readonly tagRepository: TagRepository,
    ) { }

    async execute(postId: string, tagId: string, currentUser: UserEntity): Promise<void> {
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

        if (!post.tags.some(t => t.id === tag.id)) {
            throw new NotFoundException(`Association doesn't exist`);
        }

        post.removeTag(tagId);
        await this.postRepository.updatePost(post.id, post);
    }
}
