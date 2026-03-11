import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { PostRepository } from '../../domain/repositories/post.repository';

@Injectable()
export class UpdatePostSlugUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(id: string, slug: string, user: UserEntity): Promise<void> {
        const post = await this.postRepository.getPostById(id);
        if (!post) throw new NotFoundException('Post not found');

        if (post.authorId !== user.id && user.role !== 'admin') {
            throw new ForbiddenException('Only author or admin can update post slug');
        }

        if (post.slug === slug) return;

        const existing = await this.postRepository.getPostBySlug(slug);
        if (existing && existing.id !== id) {
            throw new ConflictException('Slug already in use');
        }

        post.updateSlug(slug);
        await this.postRepository.updatePost(id, post);
    }
}
