import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { User } from '../user/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Mock the TypeORM repositories to simulate database interactions without hitting a real database.
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

  // Set up the testing module with mock providers before each test.
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

    // Clear all mock calls and instances after each test to prevent side effects.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test Suite for `create` method ---
  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const userId = 1;
      const mockUser = { id: userId, email: 'test@example.com', categories: [], snippets: [] };
      const newCategory = { ...createCategoryDto, user: mockUser };
      const expectedCategory = { id: 1, ...newCategory };

      // Mock the necessary repository calls for a successful creation flow.
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(categoryRepository, 'create').mockReturnValue(newCategory);
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(expectedCategory);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null); // No existing category with the same name.

      const result = await service.create(createCategoryDto, userId);

      // Assert that repository methods were called with the correct arguments.
      expect(categoryRepository.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        user: mockUser,
      });
      expect(categoryRepository.save).toHaveBeenCalledWith(newCategory);
      // Assert that the service returns the expected category object.
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Mock the user repository to return null.
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // Assert that the service throws the correct exception.
      await expect(service.create({ name: 'Test' }, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if category with same name already exists', async () => {
        const createCategoryDto: CreateCategoryDto = { name: 'Existing Category' };
        const userId = 1;
        const mockUser = { id: userId, email: 'test@example.com', categories: [], snippets: [] };
        const existingCategory = { id: 1, ...createCategoryDto, userId };
  
        // Mock to find an existing category with the same name.
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(existingCategory);
  
        // Assert that the service throws the ConflictException.
        await expect(service.create(createCategoryDto, userId)).rejects.toThrow(ConflictException);
      });
  });

  // --- Test Suite for `findAll` method ---
  describe('findAll', () => {
    it('should return an array of categories for a user', async () => {
      const userId = 1;
      const categories = [
        { id: 1, name: 'General', userId },
        { id: 2, name: 'Work', userId },
      ];
      // Mock the find method to return a list of categories.
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(categories);
      const result = await service.findAll(userId);
      
      // Assert that find was called with the correct query options.
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user']
      });
      // Assert the returned result is the expected array.
      expect(result).toEqual(categories);
    });
  });

  // --- Test Suite for `findOne` method ---
  describe('findOne', () => {
    it('should return a category if it exists and belongs to the user', async () => {
      const categoryId = 1;
      const userId = 1;
      const mockCategory = { id: categoryId, name: 'Test Category', userId };
      // Mock findOne to return a single category.
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(mockCategory);
      const result = await service.findOne(categoryId, userId);
      
      // Assert that findOne was called with the correct criteria.
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user: { id: userId } },
        relations: ['user']
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category is not found', async () => {
      // Mock findOne to return null.
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Suite for `update` method ---
  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 1;
      const userId = 1;
      const updateDto: UpdateCategoryDto = { name: 'Updated Category' };
      const mockCategory = { id: categoryId, name: 'Original Name', userId };
      const updatedCategory = { ...mockCategory, ...updateDto };

      // Mock findOne twice: once to find the category to update, and a second time to ensure no name conflict.
      jest.spyOn(categoryRepository, 'findOne')
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);
      // Mock save to return the updated category.
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, userId, updateDto);

      // Verify that findOne was called twice.
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(2);

      // Assert the first call to find the category by ID.
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user: { id: userId } },
        relations: ['user'],
      });
      // Assert the second call to check for a name conflict.
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: updateDto.name, user: { id: userId } },
      });

      // Assert save was called with the correctly updated object.
      expect(categoryRepository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw ConflictException if category name already exists', async () => {
      const categoryId = 1;
      const userId = 1;
      const updateDto: UpdateCategoryDto = { name: 'Existing Category' };
      const mockCategory = { id: categoryId, name: 'Original Name', userId };
      const existingCategory = { id: 2, name: 'Existing Category', userId };

      // Mock findOne twice: once to find the category to update, and a second time to simulate a name conflict.
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValueOnce(mockCategory);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValueOnce(existingCategory);

      await expect(service.update(categoryId, userId, updateDto)).rejects.toThrow(ConflictException);

      // Assert that findOne was called twice as expected.
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  // --- Test Suite for `remove` method ---
  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const categoryId = 1;
      const userId = 1;
      const mockCategory = { id: categoryId, userId };
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      // Mock findOne to find the category, and delete to simulate a successful removal.
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(categoryRepository, 'delete').mockResolvedValue(deleteResult);

      await service.remove(categoryId, userId);
      // Assert that findOne was called with the correct criteria.
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ where: { id: categoryId, user: { id: userId } } });
      // Assert that delete was called with the correct category ID.
      expect(categoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category is not found on remove', async () => {
      // Mock findOne to return null, simulating a category not being found.
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});