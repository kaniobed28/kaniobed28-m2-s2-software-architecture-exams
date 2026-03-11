import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { TagEntity } from '../../domain/entities/tag.entity';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../domain/repositories/tag.repository';
import { CreateTagDto } from '../dtos/tag.dto';

@Injectable()
export class CreateTagUseCase {
    constructor(
        @Inject(TAG_REPOSITORY_TOKEN)
        private readonly tagRepository: TagRepository,
    ) { }

    async execute(dto: CreateTagDto): Promise<TagEntity> {
        const existingTag = await this.tagRepository.findByName(dto.name);
        if (existingTag) {
            throw new ConflictException(`Tag with name ${dto.name} already exists`);
        }

        const tag = TagEntity.create(dto.name);
        await this.tagRepository.save(tag);
        return tag;
    }
}
