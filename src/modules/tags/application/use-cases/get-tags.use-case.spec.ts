import { GetTagsUseCase } from './get-tags.use-case';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TagEntity } from '../../domain/entities/tag.entity';

describe('GetTagsUseCase', () => {
    let useCase: GetTagsUseCase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(() => {
        tagRepository = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new GetTagsUseCase(tagRepository);
    });

    it('should return a list of tags', async () => {
        const tags = [TagEntity.create('js'), TagEntity.create('ts')];
        tagRepository.findAll.mockResolvedValue(tags);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result).toEqual(tags);
        expect(tagRepository.findAll).toHaveBeenCalledTimes(1);
    });
});
