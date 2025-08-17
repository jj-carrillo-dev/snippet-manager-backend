import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

// Mock the UserService to isolate the UserController's logic for unit testing.
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

  // Set up the testing module and mock providers before each test.
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

  // Test to ensure the controller is defined and correctly instantiated.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the `create` method.
  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const expectedResult = { id: 1, ...createUserDto, password: 'hashedpassword' };

      // Mock the service's `create` method to return a resolved value.
      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);
      // Verify that the service's `create` method was called with the correct DTO.
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      // Verify that the controller returns the expected result.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findAll` method.
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [{ id: 1, email: 'user1@example.com' } as User];
      // Mock the service's `findAll` method.
      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      // Verify that the service's `findAll` method was called.
      expect(service.findAll).toHaveBeenCalled();
      // Verify the controller returns the array of users.
      expect(result).toEqual(expectedResult);
    });
  });

  // Test suite for the `findOne` method.
  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      const userId = '1';
      const expectedResult = { id: +userId, email: 'user1@example.com' } as User;
      // Mock the service's `findOne` method.
      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);
      // Verify the service was called with the correct numeric ID.
      expect(service.findOne).toHaveBeenCalledWith(+userId);
      // Verify the controller returns the single user.
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Mock the service to reject with a NotFoundException.
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      // Expect the controller's method to correctly throw the exception.
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});