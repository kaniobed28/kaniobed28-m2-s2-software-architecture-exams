import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TagEntity } from '../../domain/entities/tag.entity';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../domain/repositories/tag.repository';
import { UpdateTagDto } from '../dtos/tag.dto';

@Injectable()
export class UpdateTagUseCase {
    constructor(
        @Inject(TAG_REPOSITORY_TOKEN)
        private readonly tagRepository: TagRepository,
    ) { }

    async execute(id: string, dto: UpdateTagDto): Promise<TagEntity> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new NotFoundException(`Tag with id ${id} not found`);
        }

        const existingTag = await this.tagRepository.findByName(dto.name);
        if (existingTag && existingTag.id !== id) {
            throw new ConflictException(`Tag with name ${dto.name} already exists`);
        }

        tag.update(dto.name);
        await this.tagRepository.save(tag);
        return tag;
    }
}
