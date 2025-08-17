import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new user.
 * This class defines the validation rules for the data submitted to create a user.
 */
export class CreateUserDto {
  /**
   * The username of the user.
   * @example "johndoe"
   */
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  /**
   * The email address of the user. Must be a valid email format.
   * @example "johndoe@example.com"
   */
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  /**
   * The user's password. Must be at least 8 characters long.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}