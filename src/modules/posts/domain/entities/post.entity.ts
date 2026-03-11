import { v4 } from 'uuid';
import { PostContent } from '../value-objects/post-content.value-object';
import { PostTitle } from '../value-objects/post-title.value-object';
import { PostSlug } from '../value-objects/post-slug.value-object';

export type PostStatus = 'draft' | 'waiting' | 'accepted' | 'rejected';

export interface TagModel {
  id: string;
  name: string;
}

export class PostEntity {
  private _title: PostTitle;
  private _content: PostContent;
  private _authorId: string;
  private _status: PostStatus;
  private _tags: TagModel[];
  private _slug: PostSlug;

  private constructor(
    readonly id: string,
    title: PostTitle,
    content: PostContent,
    authorId: string,
    status: PostStatus,
    slug: PostSlug,
    tags: TagModel[] = [],
  ) {
    this._title = title;
    this._content = content;
    this._authorId = authorId;
    this._status = status;
    this._slug = slug;
    this._tags = tags;
  }

  public get tags(): TagModel[] {
    return this._tags;
  }

  public get status() {
    return this._status;
  }

  public get authorId() {
    return this._authorId;
  }

  public get title() {
    return this._title.toString();
  }

  public get slug() {
    return this._slug.toString();
  }

  public static reconstitute(input: Record<string, unknown>) {
    return new PostEntity(
      input.id as string,
      new PostTitle(input.title as string),
      new PostContent(input.content as string),
      input.authorId as string,
      input.status as PostStatus,
      new PostSlug(input.slug as string),
      (input.tags as TagModel[]) || [],
    );
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      title: this._title.toString(),
      content: this._content.toString(),
      status: this._status,
      authorId: this._authorId,
      slug: this._slug.toString(),
      tags: this._tags,
    };
  }

  public static create(
    title: string,
    content: string,
    authorId: string,
    slugStr?: string,
  ): PostEntity {
    const slug = slugStr ? new PostSlug(slugStr) : PostSlug.generateFromTitle(title);
    return new PostEntity(
      v4(),
      new PostTitle(title),
      new PostContent(content),
      authorId,
      'draft',
      slug,
      [],
    );
  }

  public update(title?: string, content?: string) {
    if (title) {
      this._title = new PostTitle(title);
    }

    if (content) {
      this._content = new PostContent(content);
    }
  }

  public updateSlug(newSlug: string) {
    this._slug = new PostSlug(newSlug);
  }

  public changeStatus(newStatus: PostStatus) {
    this._status = newStatus;
  }

  public addTag(tag: TagModel) {
    if (!this._tags.find((t) => t.id === tag.id)) {
      this._tags.push(tag);
    }
  }

  public removeTag(tagId: string) {
    this._tags = this._tags.filter((t) => t.id !== tagId);
  }
}
