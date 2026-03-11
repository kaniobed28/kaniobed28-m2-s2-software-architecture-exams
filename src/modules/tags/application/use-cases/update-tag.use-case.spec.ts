import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateTagUseCase } from './update-tag.use-case';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TagEntity } from '../../domain/entities/tag.entity';

describe('UpdateTagUseCase', () => {
    let useCase: UpdateTagUseCase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(() => {
        tagRepository = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new UpdateTagUseCase(tagRepository);
    });

    it('should modify an existing tag successfully', async () => {
        const existingTag = TagEntity.create('old-name');
        tagRepository.findById.mockResolvedValue(existingTag);
        tagRepository.findByName.mockResolvedValue(null);
        tagRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(existingTag.id, { name: 'new-name' });

        expect(result.name).toBe('new-name');
        expect(tagRepository.save).toHaveBeenCalledWith(existingTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
        tagRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute('invalid-id', { name: 'name' })).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should throw ConflictException if another tag with the name already exists', async () => {
        const existingTag = TagEntity.create('tag1');
        const anotherTag = TagEntity.create('tag2');

        tagRepository.findById.mockResolvedValue(existingTag);
        tagRepository.findByName.mockResolvedValue(anotherTag); // Conflict! name 'tag2' belongs to another tag

        await expect(useCase.execute(existingTag.id, { name: 'tag2' })).rejects.toThrow(
            ConflictException,
        );
    });
});
