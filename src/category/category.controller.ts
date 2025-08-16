import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ValidationPipe, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('category')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.create(createCategoryDto, userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const userId = req.user.id; 
    return this.categoryService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.update(+id, userId, updateCategoryDto);
  }
  
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.remove(+id, userId);
  }
}