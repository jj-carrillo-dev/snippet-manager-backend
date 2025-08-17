import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { NotFoundException } from '@nestjs/common';

// Mock the CategoryService
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const userId = 1;
      const expectedResult = { id: 1, ...createCategoryDto, userId };

      // Mock the request object to simulate an authenticated user
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      // Tell the mock service what to return
      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto, mockReq as RequestWithUser);
      expect(service.create).toHaveBeenCalledWith(createCategoryDto, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const userId = 1;
      const expectedResult = [{ id: 1, name: 'Test Category', userId }];
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockReq as RequestWithUser);
      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const userId = 1;
      const categoryId = '1';
      const expectedResult = { id: 1, name: 'Test Category', userId };
      const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(categoryId, mockReq as RequestWithUser);
      expect(service.findOne).toHaveBeenCalledWith(+categoryId, userId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if category not found', async () => {
        const userId = 1;
        const categoryId = '999';
        const mockReq: Partial<RequestWithUser> = { user: { id: userId, email: 'test@example.com', categories:[], snippets:[] } };

        (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

        await expect(controller.findOne(categoryId, mockReq as RequestWithUser)).rejects.toThrow(NotFoundException);
    });
  });
});

     