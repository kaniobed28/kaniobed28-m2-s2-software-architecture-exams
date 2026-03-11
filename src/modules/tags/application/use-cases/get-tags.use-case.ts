import { Inject, Injectable } from '@nestjs/common';
import { TagEntity } from '../../domain/entities/tag.entity';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../domain/repositories/tag.repository';

@Injectable()
export class GetTagsUseCase {
    constructor(
        @Inject(TAG_REPOSITORY_TOKEN)
        private readonly tagRepository: TagRepository,
    ) { }

    async execute(): Promise<TagEntity[]> {
        return this.tagRepository.findAll();
    }
}
