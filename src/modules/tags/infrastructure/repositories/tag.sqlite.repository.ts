import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from '../../domain/entities/tag.entity';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { SQLiteTagEntity } from '../entities/tag.sqlite.entity';

@Injectable()
export class TagSQLiteRepository implements TagRepository {
    constructor(
        @InjectRepository(SQLiteTagEntity)
        private readonly repository: Repository<SQLiteTagEntity>,
    ) { }

    async findById(id: string): Promise<TagEntity | null> {
        const entity = await this.repository.findOne({ where: { id } });
        if (!entity) return null;
        return TagEntity.reconstitute({
            id: entity.id,
            name: entity.name,
            createdAt: entity.createdAt,
        });
    }

    async findByName(name: string): Promise<TagEntity | null> {
        const entity = await this.repository.findOne({ where: { name } });
        if (!entity) return null;
        return TagEntity.reconstitute({
            id: entity.id,
            name: entity.name,
            createdAt: entity.createdAt,
        });
    }

    async findAll(): Promise<TagEntity[]> {
        const entities = await this.repository.find({
            order: { name: 'ASC' },
            relations: ['posts']
        });
        // Normally, building the domain entity list
        return entities.map((entity) =>
            TagEntity.reconstitute({
                id: entity.id,
                name: entity.name,
                createdAt: entity.createdAt,
            })
        );
    }

    async save(tag: TagEntity): Promise<void> {
        const entity = this.repository.create({
            id: tag.id,
            name: tag.name,
            createdAt: tag.createdAt,
        });
        await this.repository.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
