import { v4 } from 'uuid';
import { CommentContent } from '../value-objects/comment-content.value-object';

export class CommentEntity {
    private _content: CommentContent;
    private readonly _authorId: string;
    private readonly _postId: string;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    private constructor(
        readonly id: string,
        content: CommentContent,
        authorId: string,
        postId: string,
        createdAt: Date,
        updatedAt: Date,
    ) {
        this._content = content;
        this._authorId = authorId;
        this._postId = postId;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    public get content() {
        return this._content.toString();
    }

    public get authorId() {
        return this._authorId;
    }

    public get postId() {
        return this._postId;
    }

    public get createdAt() {
        return this._createdAt;
    }

    public get updatedAt() {
        return this._updatedAt;
    }

    public static reconstitute(input: Record<string, unknown>) {
        return new CommentEntity(
            input.id as string,
            new CommentContent(input.content as string),
            input.authorId as string,
            input.postId as string,
            new Date(input.createdAt as string | Date),
            new Date(input.updatedAt as string | Date),
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            content: this._content.toString(),
            authorId: this._authorId,
            postId: this._postId,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
        };
    }

    public static create(content: string, authorId: string, postId: string): CommentEntity {
        const now = new Date();
        return new CommentEntity(
            v4(),
            new CommentContent(content),
            authorId,
            postId,
            now,
            now,
        );
    }

    public update(content: string) {
        this._content = new CommentContent(content);
        this._updatedAt = new Date();
    }
}
