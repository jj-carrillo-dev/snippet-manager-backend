import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock the TypeORM repository
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = { id: 1, ...createUserDto, password: hashedPassword };

      (usersRepository.create as jest.Mock).mockReturnValue(newUser);
      (usersRepository.save as jest.Mock).mockResolvedValue(newUser);

      const result = await service.create(createUserDto);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
      });
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' }];
      (usersRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      const user = { id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const user = { id: 1, email: 'user1@example.com', username: 'user1', password: 'hashedpassword' };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);
      (usersRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toEqual({ affected: 1 });
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});