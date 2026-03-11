import { InvalidPostSlugException, PostSlug } from './post-slug.value-object';

describe('PostSlug', () => {
    describe('constructor validation', () => {
        it('should create a valid slug', () => {
            const slug = new PostSlug('valid-slug-123');
            expect(slug.toString()).toBe('valid-slug-123');
        });

        it('should throw InvalidPostSlugException for invalid formats', () => {
            expect(() => new PostSlug('Invalid-Slug')).toThrow(InvalidPostSlugException);
            expect(() => new PostSlug('invalid slug')).toThrow(InvalidPostSlugException);
            expect(() => new PostSlug('slug_with_underscores')).toThrow(InvalidPostSlugException);
            expect(() => new PostSlug('slug@special')).toThrow(InvalidPostSlugException);
        });
    });

    describe('generateFromTitle', () => {
        it('should lowercase titles and replace spaces with hyphens', () => {
            const slug = PostSlug.generateFromTitle('Hello World 123');
            expect(slug.toString()).toBe('hello-world-123');
        });

        it('should strip special characters', () => {
            const slug = PostSlug.generateFromTitle('My Awesome Title! @#$ %');
            expect(slug.toString()).toBe('my-awesome-title');
        });

        it('should handle leading, trailing, and repeated hyphens', () => {
            const slug = PostSlug.generateFromTitle('---Hello---  World---');
            expect(slug.toString()).toBe('hello-world');
        });

        it('should fallback to post if title is completely stripped', () => {
            const slug = PostSlug.generateFromTitle('!!!!!');
            expect(slug.toString()).toBe('post');
        });
    });
});
