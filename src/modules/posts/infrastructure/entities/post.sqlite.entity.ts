import { Column, Entity, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import type { PostStatus } from '../../domain/entities/post.entity';
import { SQLiteTagEntity } from '../../../tags/infrastructure/entities/tag.sqlite.entity';

@Entity('posts')
export class SQLitePostEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  content: string;

  @Column({ type: 'varchar' })
  status: PostStatus;

  @Column()
  authorId: string;

  @ManyToMany(() => SQLiteTagEntity, (tag: SQLiteTagEntity) => tag.posts, { cascade: true })
  @JoinTable({
    name: 'posts_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: SQLiteTagEntity[];
}
