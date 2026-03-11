import { Column, Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('follows')
export class SQLiteFollowEntity {
    @PrimaryColumn()
    followerId: string;

    @PrimaryColumn()
    followingId: string;

    @CreateDateColumn()
    createdAt: Date;
}
