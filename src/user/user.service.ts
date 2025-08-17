import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  /**
   * Creates a new user in the database.
   * Hashes the password before saving to ensure security.
   * @param createUserDto The data transfer object containing user information.
   * @returns A promise that resolves to the newly created user entity.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  /**
   * Finds all users.
   * @returns A promise that resolves to an array of all user entities.
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Finds a single user by their ID.
   * Throws a NotFoundException if the user does not exist.
   * @param id The ID of the user to find.
   * @returns A promise that resolves to the found user entity.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * Finds a single user by their globally unique identifier (GUID).
   * Throws a NotFoundException if the user does not exist.
   * @param guid The GUID of the user to find.
   * @returns A promise that resolves to the found user entity.
   */
  async findOneByGuid(guid: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { guid } });
    if (!user) {
      throw new NotFoundException(`User with GUID "${guid}" not found`);
    }
    return user;
  }

  /**
   * Updates a user's information.
   * First finds the user to ensure it exists, then updates the fields and saves.
   * @param id The ID of the user to update.
   * @param updateUserDto The data transfer object with the updated information.
   * @returns A promise that resolves to the updated user entity.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Re-use findOne to check if user exists
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Removes a user from the database.
   * Throws a NotFoundException if the user does not exist.
   * @param id The ID of the user to remove.
   * @returns A promise that resolves to a DeleteResult.
   */
  async remove(id: number): Promise<DeleteResult> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.delete(id);
  }

  /**
   * Finds a single user by their email address.
   * This method is useful for authentication purposes.
   * @param email The email address of the user to find.
   * @returns A promise that resolves to the user entity or undefined if not found.
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  /**
   * Finds a single user based on specified criteria.
   * Throws a NotFoundException if no user is found.
   * @param params The TypeORM find options to query the user.
   * @returns A promise that resolves to the found user entity.
   */
  async findOneWithParams(params: any): Promise<User> {
    const user = await this.usersRepository.findOne(params);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }
}