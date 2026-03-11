import { Column, CreateDateColumn, Entity, PrimaryColumn, ManyToMany } from 'typeorm';
import { SQLitePostEntity } from '../../../posts/infrastructure/entities/post.sqlite.entity';

@Entity('tags')
export class SQLiteTagEntity {
    @PrimaryColumn()
    id: string;

    @Column({ unique: true })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(() => SQLitePostEntity, (post) => post.tags)
    posts: SQLitePostEntity[];
}
