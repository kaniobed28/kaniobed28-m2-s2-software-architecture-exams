import { CommentEntity } from '../entities/comment.entity';

export interface GetCommentsOptions {
    page?: number;
    pageSize?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export abstract class CommentRepository {
    public abstract getCommentsForPost(postId: string, options?: GetCommentsOptions): Promise<[CommentEntity[], number]>;
    public abstract getCommentCountForPost(postId: string): Promise<number>;
    public abstract getCommentById(id: string): Promise<CommentEntity | undefined>;
    public abstract createComment(input: CommentEntity): Promise<void>;
    public abstract updateComment(id: string, input: CommentEntity): Promise<void>;
    public abstract deleteComment(id: string): Promise<void>;
}
