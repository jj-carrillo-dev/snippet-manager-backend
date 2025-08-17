import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/user/entities/user.entity';

/**
 * Service responsible for handling all category-related operations.
 * It provides methods for creating, finding, updating, and deleting categories.
 */
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new category for a specific user.
   * Throws a ConflictException if a category with the same name already exists for the user.
   * Throws a NotFoundException if the user does not exist.
   * @param createCategoryDto The data transfer object for category creation.
   * @param userId The ID of the user creating the category.
   * @returns A promise that resolves to the newly created category.
   */
  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {

    // Check if a category with the same name already exists for this user.
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name, user: { id: userId } },
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists for this user');
    }

    // Find the user to associate the category with.
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('User not found');
    }

    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user: user,
    });
    return this.categoryRepository.save(newCategory);
  }

  /**
   * Retrieves all categories belonging to a specific user.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of categories.
   */
  async findAll(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  /**
   * Finds a single category by its ID and user ID.
   * Throws a NotFoundException if the category does not exist or does not belong to the user.
   * @param id The ID of the category.
   * @param userId The ID of the user.
   * @returns A promise that resolves to the found category.
   */
  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  /**
   * Updates an existing category.
   * Throws a NotFoundException if the category does not exist or does not belong to the user.
   * Throws a ConflictException if the new name is already in use by another category for the same user.
   * @param id The ID of the category to update.
   * @param userId The ID of the user.
   * @param updateCategoryDto The data transfer object for category updates.
   * @returns A promise that resolves to the updated category.
   */
  async update(id: number, userId: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name, user: { id: userId } },
      });
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists for this user');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  /**
   * Removes a category from the database.
   * Throws a NotFoundException if the category does not exist or does not belong to the user.
   * @param id The ID of the category to remove.
   * @param userId The ID of the user.
   * @returns A promise that resolves to a TypeORM DeleteResult.
   */
  async remove(id: number, userId: number): Promise<DeleteResult> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } }
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return this.categoryRepository.delete(id);
  }
}