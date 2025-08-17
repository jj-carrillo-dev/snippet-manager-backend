import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

// Mock the UserService
const mockUserService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const expectedResult = { id: 1, ...createUserDto, password: 'hashedpassword' };

      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [{ id: 1, email: 'user1@example.com' } as User];
      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);
      
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      const userId = '1';
      const expectedResult = { id: +userId, email: 'user1@example.com' } as User;
      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);
      expect(service.findOne).toHaveBeenCalledWith(+userId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});