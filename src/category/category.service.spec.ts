import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { User } from '../user/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Mock the TypeORM repositories
const mockCategoryRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: Repository<Category>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks after each test to prevent side effects
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Create Tests ---
  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const userId = 1;
      const mockUser = { id: userId, email: 'test@example.com', categories: [], snippets: [] };
      const newCategory = { ...createCategoryDto, user: mockUser };
      const expectedCategory = { id: 1, ...newCategory };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(categoryRepository, 'create').mockReturnValue(newCategory);
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(expectedCategory);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);

      const result = await service.create(createCategoryDto, userId);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        user: mockUser,
      });
      expect(categoryRepository.save).toHaveBeenCalledWith(newCategory);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.create({ name: 'Test' }, 999)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Read Tests (findAll & findOne) ---
  describe('findAll', () => {
    it('should return an array of categories for a user', async () => {
      const userId = 1;
      const categories = [
        { id: 1, name: 'General', userId },
        { id: 2, name: 'Work', userId },
      ];
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(categories);
      const result = await service.findAll(userId);
      
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user'] // <-- Add the relations array
      });
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category if it exists and belongs to the user', async () => {
      const categoryId = 1;
      const userId = 1;
      const mockCategory = { id: categoryId, name: 'Test Category', userId };
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(mockCategory);
      const result = await service.findOne(categoryId, userId);
      // CORRECTED EXPECT STATEMENT
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user: { id: userId } },
        relations: ['user'] // <-- Add the relations array
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category is not found', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Update Tests ---
  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 1;
      const userId = 1;
      const updateDto: UpdateCategoryDto = { name: 'Updated Category' };
      const mockCategory = { id: categoryId, name: 'Original Name', userId };
      const updatedCategory = { ...mockCategory, ...updateDto };

      // Mock the first findOne call to find the category to update
      jest.spyOn(categoryRepository, 'findOne')
        .mockResolvedValueOnce(mockCategory)
        // Mock the second findOne call to check for name conflict.
        .mockResolvedValueOnce(null);

      // Mock save to return the updated category
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(updatedCategory);

      // Call the service method
      const result = await service.update(categoryId, userId, updateDto);

      // Assert findOne was called twice as expected
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(2);

      // Assert the first call to find the category to update
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user: { id: userId } },
        relations: ['user'],
      });

      // Assert the second call to check for a name conflict
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: updateDto.name, user: { id: userId } },
      });

      // Assert save was called with the updated object
      expect(categoryRepository.save).toHaveBeenCalledWith(updatedCategory);

      // Assert the final result is the updated object
      expect(result).toEqual(updatedCategory);
    });

    it('should throw ConflictException if category name already exists', async () => {
      const categoryId = 1;
      const userId = 1;
      const updateDto: UpdateCategoryDto = { name: 'Existing Category' };
      const mockCategory = { id: categoryId, name: 'Original Name', userId };
      const existingCategory = { id: 2, name: 'Existing Category', userId };

      // Mock the first findOne call to find the category to update
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValueOnce(mockCategory);
      // Mock the second findOne call to simulate a name conflict
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValueOnce(existingCategory);

      // Expect the method to throw the ConflictException
      await expect(service.update(categoryId, userId, updateDto)).rejects.toThrow(ConflictException);

      // Assert that findOne was called twice as expected
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  // --- Delete Tests ---
  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const categoryId = 1;
      const userId = 1;
      const mockCategory = { id: categoryId, userId };
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(categoryRepository, 'delete').mockResolvedValue(deleteResult);

      await service.remove(categoryId, userId);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ where: { id: categoryId, user: { id: userId } } });
      expect(categoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category is not found on remove', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});