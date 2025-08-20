import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/UserResponseDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user in the database.
   * Hashes the password before saving to ensure security.
   * @param createUserDto The data transfer object containing user information.
   * @returns A promise that resolves to the newly created user response object.
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(newUser);
    return this.toUserResponseDto(savedUser);
  }

  /**
   * Finds all users.
   * @returns A promise that resolves to an array of all user response objects.
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.toUserResponseDto(user));
  }

  /**
   * Finds a single user by their ID.
   * Throws a NotFoundException if the user does not exist.
   * @param id The ID of the user to find.
   * @returns A promise that resolves to the found user response object.
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return this.toUserResponseDto(user);
  }

  /**
   * Finds a single user by their globally unique identifier (GUID).
   * Throws a NotFoundException if the user does not exist.
   * @param guid The GUID of the user to find.
   * @returns A promise that resolves to the found user response object.
   */
  async findOneByGuid(guid: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { guid } });
    if (!user) {
      throw new NotFoundException(`User with GUID "${guid}" not found`);
    }
    return this.toUserResponseDto(user);
  }

  /**
   * Updates a user's information.
   * First finds the user to ensure it exists, then updates the fields and saves.
   * @param id The ID of the user to update.
   * @param updateUserDto The data transfer object with the updated information.
   * @returns A promise that resolves to the updated user response object.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOne(id); // Re-use findOne to check if user exists
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.toUserResponseDto(updatedUser);
  }

  // The 'remove' method does not return a UserResponseDto, as it's a deletion.
  async remove(id: number): Promise<DeleteResult> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.delete(id);
  }

  // The 'findOneByEmail' method is for internal use (e.g., authentication)
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  // The 'findOneWithParams' method is also for internal use
  async findOneWithParams(params: any): Promise<User> {
    const user = await this.usersRepository.findOne(params);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  /**
   * Private helper method to transform a User entity to a UserResponseDto.
   * @param user The User entity to transform.
   * @returns The transformed UserResponseDto.
   */
  private toUserResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }
}