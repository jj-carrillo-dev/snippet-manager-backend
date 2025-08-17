import { Test, TestingModule } from '@nestjs/testing';
import { SnippetController } from './snippet.controller';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { NotFoundException } from '@nestjs/common';

// Mock the SnippetService to isolate the controller's functionality for unit testing.
const mockSnippetService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('SnippetController', () => {
  let controller: SnippetController;
  let service: SnippetService;

  // Set up the testing module and mock providers before each test.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnippetController],
      providers: [
        {
          provide: SnippetService,
          useFactory: mockSnippetService,
        },
      ],
    }).compile();

    controller = module.get<SnippetController>(SnippetController);
    service = module.get<SnippetService>(SnippetService);
  });

  // Test to ensure the controller is correctly instantiated.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the `create` endpoint.
  describe('create', () => {
    it('should create a new snippet for the authenticated user', async () => {
      const createSnippetDto: CreateSnippetDto = {
        title: 'Test Snippet',
        content: 'console.log("hello world");',
        language: 'javascript',
        categoryId: 1,
      };
      const userId = 1;
      const expectedResult = { id: 1, ...createSnippetDto, userId };
      // Create a mock request object with an authenticated user.
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      // Mock the service's create method to return a resolved value.
      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createSnippetDto, mockReq as any);
      // Verify the service was called with the correct DTO and user ID.
      expect(service.create).toHaveBeenCalledWith(createSnippetDto, userId);
      // Verify that the controller returns the expected result.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findAll` endpoint.
  describe('findAll', () => {
    it('should return an array of snippets for the authenticated user', async () => {
      const userId = 1;
      const expectedResult = [{ id: 1, title: 'Test', userId }];
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      // Mock the service's findAll method to return an array of snippets.
      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockReq as any);
      // Verify the service was called with the correct user ID.
      expect(service.findAll).toHaveBeenCalledWith(userId);
      // Verify that the controller returns the expected array.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findOne` endpoint.
  describe('findOne', () => {
    it('should return a single snippet for the authenticated user', async () => {
      const userId = 1;
      const snippetId = '1';
      const expectedResult = { id: 1, title: 'Test', userId };
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      // Mock the service's findOne method to return a single snippet.
      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(snippetId, mockReq as any);
      // Verify the service was called with the correct snippet ID and user ID.
      expect(service.findOne).toHaveBeenCalledWith(+snippetId, userId);
      // Verify that the controller returns the expected snippet.
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if snippet not found', async () => {
      const userId = 1;
      const snippetId = '999';
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      // Mock the service to reject with a NotFoundException.
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      // Expect the controller's method to correctly throw the exception.
      await expect(controller.findOne(snippetId, mockReq as any)).rejects.toThrow(NotFoundException);
    });
  });

  // Test suite for the `update` endpoint.
  describe('update', () => {
      it('should update a snippet successfully', async () => {
          const userId = 1;
          const snippetId = '1';
          const updateDto: UpdateSnippetDto = { title: 'Updated Title' };
          const expectedResult = { id: +snippetId, ...updateDto, userId };
          const mockReq = { user: { id: userId, email: 'test@example.com' } };
  
          // Mock the service's update method to return the updated snippet.
          (service.update as jest.Mock).mockResolvedValue(expectedResult);
  
          const result = await controller.update(snippetId, updateDto, mockReq as any);
          // Verify that the service was called with the correct arguments.
          expect(service.update).toHaveBeenCalledWith(+snippetId, updateDto, userId);
          // Verify that the controller returns the updated snippet.
          expect(result).toEqual(expectedResult);
      });
  });
});