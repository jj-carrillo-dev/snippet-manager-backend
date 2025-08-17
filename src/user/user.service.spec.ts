import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock the TypeORM repository. This factory creates a mock for each repository method used in the service.
const mockUsersRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let usersRepository: Repository<User>;

  // Set up the testing module before each test to ensure a clean state.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // A simple test to confirm the service is instantiated.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test suite for the `create` method.
  describe('create', () => {
    // Test case for successful user creation.
    it('should successfully create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = { id: 1, ...createUserDto, password: hashedPassword };

      // Mock the repository methods to simulate a successful save.
      (usersRepository.create as jest.Mock).mockReturnValue(newUser);
      (usersRepository.save as jest.Mock).mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      // Verify that the `create` and `save` methods were called with the correct data.
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String), // We only care that the password is a hashed string.
      });
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      // Verify the returned result matches the expected user object.
      expect(result).toEqual(newUser);
    });
  });

  // Test suite for the `findAll` method.
  describe('findAll', () => {
    // Test case to verify all users are returned.
    it('should return an array of users', async () => {
      const users = [{ id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' }];
      // Mock the `find` method to return an array of users.
      (usersRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();
      // Verify the result is the expected array and the `find` method was called.
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  // Test suite for the `findOne` method.
  describe('findOne', () => {
    // Test case for finding a user by ID.
    it('should return a single user by ID', async () => {
      const user = { id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' };
      // Mock the `findOne` method to return a user.
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(1);
      // Verify the result matches the user and `findOne` was called with the correct ID.
      expect(result).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    // Test case for handling a non-existent user.
    it('should throw NotFoundException if user not found', async () => {
      // Mock `findOne` to return null, simulating a user not being found.
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
      // Expect the service method to throw the correct exception.
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // Test suite for the `remove` method.
  describe('remove', () => {
    // Test case for successful user removal.
    it('should delete a user successfully', async () => {
      const user = { id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' };
      // Mock `findOne` to find the user first.
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);
      // Mock `delete` to simulate a successful deletion.
      (usersRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      // Verify the result shows one affected row and `delete` was called with the correct ID.
      expect(result).toEqual({ affected: 1 });
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    // Test case for handling a non-existent user on removal.
    it('should throw NotFoundException if user not found', async () => {
      // Mock `findOne` to return null.
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
      // Expect the method to throw the correct exception.
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});