import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/auth/infrastructure/decorators/roles.decorator';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from '../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from '../../application/use-cases/delete-tag.use-case';
import { GetTagsUseCase } from '../../application/use-cases/get-tags.use-case';
import { CreateTagDto, UpdateTagDto } from '../../application/dtos/tag.dto';

@Controller('tags')
export class TagsController {
    constructor(
        private readonly createTagUseCase: CreateTagUseCase,
        private readonly updateTagUseCase: UpdateTagUseCase,
        private readonly deleteTagUseCase: DeleteTagUseCase,
        private readonly getTagsUseCase: GetTagsUseCase,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateTagDto) {
        const tag = await this.createTagUseCase.execute(dto);
        return tag.toJSON();
    }

    @Get()
    async findAll() {
        const tags = await this.getTagsUseCase.execute();
        return { tags: tags.map(tag => tag.toJSON()) };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
        const tag = await this.updateTagUseCase.execute(id, dto);
        return tag.toJSON();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deleteTagUseCase.execute(id);
    }
}
