export class CreateTagDto {
    name: string;
}

export class UpdateTagDto {
    name: string;
}

export class TagResponseDto {
    id: string;
    name: string;
    createdAt: string;
    postCount?: number;
}
