import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { NotFoundException } from '@nestjs/common';

// Mock the CategoryService to isolate the controller's functionality for unit testing.
const mockCategoryService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  // Set up the testing module and mock providers before each test.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useFactory: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  // A simple test to confirm the controller is correctly instantiated.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the `create` endpoint.
  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const userId = 1;
      const expectedResult = { id: 1, ...createCategoryDto, userId };

      // Mock the request object to simulate an authenticated user and inject the user ID.
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      // Tell the mock service what to return.
      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto, mockReq as RequestWithUser);
      // Verify that the service was called with the correct DTO and user ID.
      expect(service.create).toHaveBeenCalledWith(createCategoryDto, userId);
      // Verify that the controller returns the expected result.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findAll` endpoint.
  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const userId = 1;
      const expectedResult = [{ id: 1, name: 'Test Category', userId }];
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      // Mock the service's `findAll` method.
      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockReq as RequestWithUser);
      // Verify that the service was called with the correct user ID.
      expect(service.findAll).toHaveBeenCalledWith(userId);
      // Verify that the controller returns the array of categories.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findOne` endpoint.
  describe('findOne', () => {
    it('should return a single category', async () => {
      const userId = 1;
      const categoryId = '1';
      const expectedResult = { id: 1, name: 'Test Category', userId };
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      // Mock the service's `findOne` method.
      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(categoryId, mockReq as RequestWithUser);
      // Verify the service was called with the correct numeric ID and user ID.
      expect(service.findOne).toHaveBeenCalledWith(+categoryId, userId);
      // Verify the controller returns the expected single category.
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if category not found', async () => {
        const userId = 1;
        const categoryId = '999';
        const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

        // Mock the service to reject with a NotFoundException.
        (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

        // Expect the controller's method to correctly throw the exception.
        await expect(controller.findOne(categoryId, mockReq as RequestWithUser)).rejects.toThrow(NotFoundException);
    });
  });
});