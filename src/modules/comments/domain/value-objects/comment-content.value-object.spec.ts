import { CommentContent, InvalidCommentContentException } from './comment-content.value-object';

describe('CommentContent Value Object', () => {
    it('should create a valid content', () => {
        const content = new CommentContent('This is a great post!');
        expect(content.toString()).toBe('This is a great post!');
    });

    it('should throw InvalidCommentContentException if empty', () => {
        expect(() => new CommentContent('')).toThrow(InvalidCommentContentException);
    });

    it('should throw InvalidCommentContentException if too long', () => {
        const longContent = 'A'.repeat(1001);
        expect(() => new CommentContent(longContent)).toThrow(InvalidCommentContentException);
    });

    it('should handle exactly 1000 characters', () => {
        const maxContent = 'A'.repeat(1000);
        const content = new CommentContent(maxContent);
        expect(content.toString()).toHaveLength(1000);
    });
});
