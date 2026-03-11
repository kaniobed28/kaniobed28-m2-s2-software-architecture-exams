import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TAG_REPOSITORY_TOKEN, type TagRepository } from '../../domain/repositories/tag.repository';

@Injectable()
export class DeleteTagUseCase {
    constructor(
        @Inject(TAG_REPOSITORY_TOKEN)
        private readonly tagRepository: TagRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new NotFoundException(`Tag with id ${id} not found`);
        }

        await this.tagRepository.delete(id);
    }
}
