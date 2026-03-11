import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository, GetCommentsOptions } from '../../domain/repositories/comment.repository';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { CommentEntity } from '../../domain/entities/comment.entity';

export interface PaginatedCommentsResult {
    comments: CommentEntity[];
    total: number;
    page: number;
    pageSize: number;
}

@Injectable()
export class GetCommentsForPostUseCase {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) { }

    public async execute(postId: string, options?: GetCommentsOptions): Promise<PaginatedCommentsResult> {
        const post = await this.postRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 20;

        const [comments, total] = await this.commentRepository.getCommentsForPost(postId, options);

        return {
            comments,
            total,
            page,
            pageSize,
        };
    }
}
