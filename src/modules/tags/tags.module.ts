import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLiteTagEntity } from './infrastructure/entities/tag.sqlite.entity';
import { TagSQLiteRepository } from './infrastructure/repositories/tag.sqlite.repository';
import { TAG_REPOSITORY_TOKEN } from './domain/repositories/tag.repository';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from './application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from './application/use-cases/delete-tag.use-case';
import { GetTagsUseCase } from './application/use-cases/get-tags.use-case';
import { TagsController } from './infrastructure/controllers/tag.controller';

const repositories = [
    {
        provide: TAG_REPOSITORY_TOKEN,
        useClass: TagSQLiteRepository,
    },
];

const useCases = [
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    GetTagsUseCase,
];

@Module({
    imports: [TypeOrmModule.forFeature([SQLiteTagEntity])],
    controllers: [TagsController],
    providers: [...repositories, ...useCases],
    exports: [...repositories, ...useCases],
})
export class TagsModule { }
