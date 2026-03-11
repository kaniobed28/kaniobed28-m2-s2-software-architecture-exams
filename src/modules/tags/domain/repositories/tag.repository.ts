import { TagEntity } from '../entities/tag.entity';

export interface TagRepository {
    findById(id: string): Promise<TagEntity | null>;
    findByName(name: string): Promise<TagEntity | null>;
    findAll(): Promise<TagEntity[]>;
    save(tag: TagEntity): Promise<void>;
    delete(id: string): Promise<void>;
}

export const TAG_REPOSITORY_TOKEN = Symbol('TagRepository');
