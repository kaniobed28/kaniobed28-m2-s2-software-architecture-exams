import { CommentEntity } from './comment.entity';

describe('CommentEntity', () => {
    it('should be created correctly', () => {
        const comment = CommentEntity.create('This is a content', 'author-id', 'post-id');

        expect(comment.id).toBeDefined();
        expect(comment.content).toBe('This is a content');
        expect(comment.authorId).toBe('author-id');
        expect(comment.postId).toBe('post-id');
        expect(comment.createdAt).toBeInstanceOf(Date);
    });

    it('should be reconstituted correctly', () => {
        const date = new Date();
        const comment = CommentEntity.reconstitute({
            id: 'comment-1',
            content: 'reconstituted',
            authorId: 'author-1',
            postId: 'post-1',
            createdAt: date.toISOString(),
        });

        expect(comment.id).toBe('comment-1');
        expect(comment.content).toBe('reconstituted');
        expect(comment.authorId).toBe('author-1');
        expect(comment.postId).toBe('post-1');
        expect(comment.createdAt).toEqual(date);
    });

    it('should update content correctly', () => {
        const comment = CommentEntity.create('old content', 'author-1', 'post-1');
        comment.update('new content');

        expect(comment.content).toBe('new content');
        expect(comment.authorId).toBe('author-1');
    });

    it('should generate JSON correctly', () => {
        const comment = CommentEntity.create('content', 'author', 'post');
        const json = comment.toJSON();

        expect(json.id).toBe(comment.id);
        expect(json.content).toBe('content');
        expect(json.authorId).toBe('author');
        expect(json.postId).toBe('post');
        expect(json.createdAt).toBe(comment.createdAt.toISOString());
    });
});
