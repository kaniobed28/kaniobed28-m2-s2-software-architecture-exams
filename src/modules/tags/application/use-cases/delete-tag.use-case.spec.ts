import { NotFoundException } from '@nestjs/common';
import { DeleteTagUseCase } from './delete-tag.use-case';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TagEntity } from '../../domain/entities/tag.entity';

describe('DeleteTagUseCase', () => {
    let useCase: DeleteTagUseCase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(() => {
        tagRepository = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new DeleteTagUseCase(tagRepository);
    });

    it('should successfully delete a tag', async () => {
        const tag = TagEntity.create('typescript');
        tagRepository.findById.mockResolvedValue(tag);
        tagRepository.delete.mockResolvedValue(undefined);

        await useCase.execute(tag.id);

        expect(tagRepository.delete).toHaveBeenCalledWith(tag.id);
    });

    it('should throw NotFoundException if tag does not exist', async () => {
        tagRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute('non-existent')).rejects.toThrow(
            NotFoundException,
        );
    });
});
