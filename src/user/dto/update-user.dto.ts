import { IsEmail, IsOptional, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for updating an existing user.
 * All fields are optional, allowing for partial updates.
 */
export class UpdateUserDto {
  /**
   * The updated username for the user.
   * This field is optional.
   */
  @IsOptional()
  @MaxLength(100)
  username: string;

  /**
   * The updated email address for the user.
   * This field is optional and must be a valid email format.
   */
  @IsOptional()
  @IsEmail()
  email: string;
}