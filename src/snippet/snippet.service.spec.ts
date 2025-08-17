import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnippetService } from './snippet.service';
import { Snippet } from './entities/snippet.entity';
import { CategoryService } from '../category/category.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

// Mock the TypeORM repository
const mockSnippetRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

// Mock the CategoryService
const mockCategoryService = () => ({
  findOne: jest.fn(),
});

describe('SnippetService', () => {
  let service: SnippetService;
  let snippetRepository: Repository<Snippet>;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnippetService,
        {
          provide: getRepositoryToken(Snippet),
          useFactory: mockSnippetRepository,
        },
        {
          provide: CategoryService,
          useFactory: mockCategoryService,
        },
      ],
    }).compile();

    service = module.get<SnippetService>(SnippetService);
    snippetRepository = module.get<Repository<Snippet>>(getRepositoryToken(Snippet));
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new snippet', async () => {
      const createSnippetDto: CreateSnippetDto = {
        title: 'New Snippet',
        content: 'console.log("hello");',
        language: 'javascript',
        categoryId: 1,
      };
      const userId = 1;
      const mockCategory = { id: 1, name: 'General' };
      const newSnippet = { ...createSnippetDto, user: { id: userId }, category: mockCategory, };
      const createdObject = {
        title: createSnippetDto.title,
        content: createSnippetDto.content,
        language: createSnippetDto.language,
        user: { id: userId },
        category: { id: createSnippetDto.categoryId },
      };

      (categoryService.findOne as jest.Mock).mockResolvedValue(mockCategory);
      (snippetRepository.create as jest.Mock).mockReturnValue(newSnippet);
      (snippetRepository.save as jest.Mock).mockResolvedValue({ id: 1, ...newSnippet });

      const result = await service.create(createSnippetDto, userId);
      expect(categoryService.findOne).toHaveBeenCalledWith(createSnippetDto.categoryId, userId);
      expect(snippetRepository.create).toHaveBeenCalledWith(createdObject);
      expect(snippetRepository.save).toHaveBeenCalledWith(newSnippet);
      expect(result).toEqual({ id: 1, ...newSnippet });
    });
  });

  it('should throw NotFoundException if category does not exist', async () => {
    const createSnippetDto: CreateSnippetDto = {
      title: 'New Snippet',
      content: 'console.log("hello");',
      language: 'javascript',
      categoryId: 999,
    };
    const userId = 1;
    (categoryService.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.create(createSnippetDto, userId)).rejects.toThrow(NotFoundException);
  });

  describe('findOne', () => {
    it('should return a snippet if it exists and belongs to the user', async () => {
      const snippetId = 1;
      const userId = 1;
      const mockSnippet = { id: snippetId, userId };
      (snippetRepository.findOne as jest.Mock).mockResolvedValue(mockSnippet);
      const result = await service.findOne(snippetId, userId);
      // Corrected expect statement to include relations
      expect(snippetRepository.findOne).toHaveBeenCalledWith({
        where: { id: snippetId, user: { id: userId } },
        relations: ['user', 'category'],
      });
      expect(result).toEqual(mockSnippet);
    });

    // ... (other test)
  });

  describe('findAll', () => {
    it('should return an array of snippets for a user', async () => {
      const userId = 1;
      const mockSnippets = [{ id: 1, title: 'Snippet 1', userId }];
      (snippetRepository.find as jest.Mock).mockResolvedValue(mockSnippets);
      const result = await service.findAll(userId);
      // Corrected expect statement to include relations
      expect(snippetRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user', 'category'], 
      });
      expect(result).toEqual(mockSnippets);
    });
  });

  describe('update', () => {
    it('should update a snippet successfully', async () => {
      const snippetId = 1;
      const userId = 1;
      const updateDto: UpdateSnippetDto = { title: 'Updated Title' };
      const mockSnippet = { id: snippetId, userId, title: 'Original Title' };
      const updatedSnippet = { ...mockSnippet, ...updateDto };

      (snippetRepository.findOne as jest.Mock).mockResolvedValue(mockSnippet);
      (snippetRepository.save as jest.Mock).mockResolvedValue(updatedSnippet);

      const result = await service.update(snippetId, updateDto, userId);
      // Corrected expect statement to include relations
      expect(snippetRepository.findOne).toHaveBeenCalledWith({
        where: { id: snippetId, user: { id: userId } },
        relations: ['category'], // <-- Add this line (or user/category, depending on your service code)
      });
      expect(snippetRepository.save).toHaveBeenCalledWith(updatedSnippet);
      expect(result).toEqual(updatedSnippet);
    });

    it('should throw NotFoundException if snippet is not found on update', async () => {
      const updateDto: UpdateSnippetDto = { title: 'Updated' };
      (snippetRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.update(999, updateDto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a snippet successfully', async () => {
      const snippetId = 1;
      const userId = 1;
      const mockSnippet = { id: snippetId, userId };

      (snippetRepository.findOne as jest.Mock).mockResolvedValue(mockSnippet);
      (snippetRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(snippetId, userId);
      expect(snippetRepository.findOne).toHaveBeenCalledWith({ where: { id: snippetId, user: { id: userId } } });
      expect(snippetRepository.delete).toHaveBeenCalledWith(snippetId);
    });

    it('should throw NotFoundException if snippet is not found on remove', async () => {
      (snippetRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});