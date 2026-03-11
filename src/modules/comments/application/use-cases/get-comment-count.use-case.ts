import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { CommentRepository } from '../../domain/repositories/comment.repository';

@Injectable()
export class GetCommentCountUseCase {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) { }

    public async execute(postId: string): Promise<{ postId: string, count: number }> {
        const post = await this.postRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const count = await this.commentRepository.getCommentCountForPost(postId);
        return { postId: post.id, count };
    }
}
