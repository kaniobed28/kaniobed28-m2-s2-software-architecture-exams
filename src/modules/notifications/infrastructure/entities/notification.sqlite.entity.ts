import { Column, Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class SQLiteNotificationEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    recipientId: string;

    @Column()
    type: string;

    @Column()
    message: string;

    @Column('simple-json')
    metadata: Record<string, unknown>;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
