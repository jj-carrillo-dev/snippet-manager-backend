import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteResult } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name, user: { id: userId } },
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists for this user');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('User not found');
    }
    console.log('User: ', user);
    console.log('Existing Category: ', existingCategory);
    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user: user,
    });
    return this.categoryRepository.save(newCategory);
  }

  async findAll(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

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