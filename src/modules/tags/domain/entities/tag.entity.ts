import { v4 } from 'uuid';
import { TagName } from '../value-objects/tag-name.value-object';

export class TagEntity {
    private _name: TagName;
    private readonly _createdAt: Date;

    private constructor(
        readonly id: string,
        name: TagName,
        createdAt: Date,
    ) {
        this._name = name;
        this._createdAt = createdAt;
    }

    get name(): string {
        return this._name.toString();
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    public static create(name: string): TagEntity {
        return new TagEntity(v4(), new TagName(name), new Date());
    }

    public static reconstitute(input: Record<string, unknown>): TagEntity {
        return new TagEntity(
            input.id as string,
            new TagName(input.name as string),
            new Date(input.createdAt as string | Date),
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            name: this._name.toString(),
            createdAt: this._createdAt.toISOString(),
        };
    }

    public update(name: string): void {
        this._name = new TagName(name);
    }
}
