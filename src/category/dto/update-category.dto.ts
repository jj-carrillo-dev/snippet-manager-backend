import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for updating a category.
 * All properties are optional, allowing for partial updates.
 */
export class UpdateCategoryDto {
  /**
   * The updated name for the category.
   * It must be a non-empty string with a minimum length of 3 and a maximum of 50 characters.
   * This property is optional.
   */
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;
}