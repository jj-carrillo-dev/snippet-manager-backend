import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ValidationPipe, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('categories')
@UseGuards(AuthGuard('jwt')) // Protects all endpoints in this controller
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Creates a new category for the authenticated user.
   * @param createCategoryDto The data transfer object containing the category name.
   * @param req The request object, containing the authenticated user's ID.
   * @returns The newly created category entity.
   */
  @Post()
  create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.create(createCategoryDto, userId);
  }

  /**
   * Retrieves all categories belonging to the authenticated user.
   * @param req The request object, containing the authenticated user's ID.
   * @returns A promise that resolves to an array of category entities.
   */
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.findAll(userId);
  }

  /**
   * Finds a single category by its ID for the authenticated user.
   * @param id The ID of the category to find.
   * @param req The request object, containing the authenticated user's ID.
   * @returns The found category entity.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.findOne(+id, userId);
  }

  /**
   * Updates an existing category for the authenticated user.
   * @param id The ID of the category to update.
   * @param updateCategoryDto The data transfer object with the updated category name.
   * @param req The request object, containing the authenticated user's ID.
   * @returns The updated category entity.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.update(+id, userId, updateCategoryDto);
  }
  
  /**
   * Deletes a category by its ID for the authenticated user.
   * @param id The ID of the category to delete.
   * @param req The request object, containing the authenticated user's ID.
   * @returns A promise that resolves to a TypeORM DeleteResult.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.remove(+id, userId);
  }
}