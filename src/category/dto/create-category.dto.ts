import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new category.
 * Defines the validation rules for the category name.
 */
export class CreateCategoryDto {
  /**
   * The name of the category.
   * It must be a string with a minimum length of 3 and a maximum length of 50 characters.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}