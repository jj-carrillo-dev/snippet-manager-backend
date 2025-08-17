import { Test, TestingModule } from '@nestjs/testing';
import { SnippetController } from './snippet.controller';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { NotFoundException } from '@nestjs/common';

// Mock the SnippetService
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new snippet', async () => {
      const createSnippetDto: CreateSnippetDto = {
        title: 'Test Snippet',
        content: 'console.log("hello world");',
        language: 'javascript',
        categoryId: 1,
      };
      const userId = 1;
      const expectedResult = { id: 1, ...createSnippetDto, userId };
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createSnippetDto, mockReq as any);
      expect(service.create).toHaveBeenCalledWith(createSnippetDto, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of snippets', async () => {
      const userId = 1;
      const expectedResult = [{ id: 1, title: 'Test', userId }];
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockReq as any);
      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single snippet', async () => {
      const userId = 1;
      const snippetId = '1';
      const expectedResult = { id: 1, title: 'Test', userId };
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(snippetId, mockReq as any);
      expect(service.findOne).toHaveBeenCalledWith(+snippetId, userId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if snippet not found', async () => {
      const userId = 1;
      const snippetId = '999';
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(snippetId, mockReq as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a snippet successfully', async () => {
      const userId = 1;
      const snippetId = '1';
      const updateDto: UpdateSnippetDto = { title: 'Updated Title' };
      const expectedResult = { id: +snippetId, ...updateDto, userId };
      const mockReq = { user: { id: userId, email: 'test@example.com' } };

      (service.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.update(snippetId, updateDto, mockReq as any);
      expect(service.update).toHaveBeenCalledWith(+snippetId, updateDto, userId);
      expect(result).toEqual(expectedResult);
    });
  });
});