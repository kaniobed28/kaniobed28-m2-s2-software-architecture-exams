import { ConflictException } from '@nestjs/common';
import { CreateTagUseCase } from './create-tag.use-case';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TagEntity } from '../../domain/entities/tag.entity';

describe('CreateTagUseCase', () => {
    let useCase: CreateTagUseCase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(() => {
        tagRepository = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new CreateTagUseCase(tagRepository);
    });

    it('should successfully create a new tag', async () => {
        tagRepository.findByName.mockResolvedValue(null);
        tagRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute({ name: 'typescript' });

        expect(result).toBeInstanceOf(TagEntity);
        expect(result.name).toBe('typescript');
        expect(tagRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if tag already exists', async () => {
        tagRepository.findByName.mockResolvedValue(TagEntity.create('typescript'));

        await expect(useCase.execute({ name: 'typescript' })).rejects.toThrow(
            ConflictException,
        );
    });
});
