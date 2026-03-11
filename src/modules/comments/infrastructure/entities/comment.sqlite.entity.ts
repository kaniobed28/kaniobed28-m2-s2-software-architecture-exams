import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class SQLiteCommentEntity {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column()
    authorId: string;

    @Column()
    postId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
