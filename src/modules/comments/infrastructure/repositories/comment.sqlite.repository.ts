import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { CommentRepository, GetCommentsOptions } from '../../domain/repositories/comment.repository';
import { SQLiteCommentEntity } from '../entities/comment.sqlite.entity';

@Injectable()
export class SQLiteCommentRepository implements CommentRepository {
    constructor(private readonly dataSource: DataSource) { }

    public async getCommentsForPost(postId: string, options?: GetCommentsOptions): Promise<[CommentEntity[], number]> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;
        const sortBy = options?.sortBy || 'createdAt';
        const sortOrder = options?.sortOrder?.toUpperCase() || 'DESC';

        const [data, total] = await this.dataSource
            .getRepository(SQLiteCommentEntity)
            .findAndCount({
                where: { postId },
                order: { [sortBy]: sortOrder as any },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

        return [data.map((comment) => CommentEntity.reconstitute({ ...comment })), total];
    }

    public async getCommentCountForPost(postId: string): Promise<number> {
        return this.dataSource.getRepository(SQLiteCommentEntity).count({ where: { postId } });
    }

    public async getCommentById(id: string): Promise<CommentEntity | undefined> {
        const comment = await this.dataSource
            .getRepository(SQLiteCommentEntity)
            .findOne({ where: { id } });

        return comment ? CommentEntity.reconstitute({ ...comment }) : undefined;
    }

    public async createComment(input: CommentEntity): Promise<void> {
        await this.dataSource.getRepository(SQLiteCommentEntity).save(input.toJSON());
    }

    public async updateComment(id: string, input: CommentEntity): Promise<void> {
        const json = input.toJSON();
        const repo = this.dataSource.getRepository(SQLiteCommentEntity);
        const entity = await repo.preload({ id, ...json });
        if (entity) await repo.save(entity);
    }

    public async deleteComment(id: string): Promise<void> {
        await this.dataSource.getRepository(SQLiteCommentEntity).delete(id);
    }
}
