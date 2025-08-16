import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snippet } from './entities/snippet.entity';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { CategoryService } from '../category/category.service';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class SnippetService {
  constructor(
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
    private categoryService: CategoryService,
  ) {}

  async create(createSnippetDto: CreateSnippetDto, userId: number): Promise<Snippet> {
    const  { categoryId, ...snippetData } = createSnippetDto;

    const category = await this.categoryService.findOne(categoryId, userId);
    if  (!category) {
      throw new NotFoundException('Category not found or you do not have permission to use it');
    }

    const newSnippet = this.snippetRepository.create({
      ...snippetData,
      user: { id: userId },
      category: { id: categoryId },
    });

    return this.snippetRepository.save(newSnippet);
  }

  async findAll(userId: number): Promise<Snippet[]> {
    return this.snippetRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'category'],
    });
  }

  async findOne(id: number, userId: number): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'category'],
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to view it');
    }

    return snippet;
  }

  async update(id: number, updateSnippetDto: UpdateSnippetDto, userId: number): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category'],
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to update it');
    }

    if (updateSnippetDto.categoryId) {
      const category = await this.categoryService.findOne(updateSnippetDto.categoryId, userId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      snippet.category = category;
      delete updateSnippetDto.categoryId;
    }

    Object.assign(snippet, updateSnippetDto);

    return this.snippetRepository.save(snippet);
  }

  async remove(id: number, userId: number): Promise<DeleteResult> {
    const snippet = await this.snippetRepository.findOne({ where: { id, user: { id: userId } } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to remove it');
    }
    return this.snippetRepository.delete(snippet.id);
  }
}