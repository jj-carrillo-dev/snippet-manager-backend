import { Controller, Post, Get, Body, UsePipes, ValidationPipe, Param, UseGuards, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';


@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true })) // Apply validation pipes globally to the controller
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user.
   * This is a public endpoint and does not require authentication.
   * @param createUserDto The data transfer object for creating a user.
   * @returns A promise that resolves to the newly created user entity.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * Retrieves all users.
   * This endpoint requires JWT authentication.
   * @returns A promise that resolves to an array of user entities.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * Finds a single user by their ID.
   * This endpoint requires JWT authentication.
   * @param id The ID of the user to find.
   * @returns A promise that resolves to the found user entity.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  /**
   * Updates an existing user by their ID.
   * This endpoint requires JWT authentication.
   * @param id The ID of the user to update.
   * @param updateUserDto The data transfer object with the updated user information.
   * @returns A promise that resolves to the updated user entity.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * Deletes a user by their ID.
   * This endpoint requires JWT authentication.
   * @param id The ID of the user to delete.
   * @returns A promise that resolves when the user is successfully removed.
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Set the response status to 204 No Content
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}