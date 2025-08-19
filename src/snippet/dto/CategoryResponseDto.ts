import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Category } from 'src/category/entities/category.entity';
import { UserResponseDto } from 'src/user/dto/UserResponseDto';

/**
 * Data Transfer Object for a category response.
 * This class defines the structure of the data sent back to the client
 * after a category is retrieved.
 */
@Exclude()
export class CategoryResponseDto {
  /**
   * The unique identifier for the category.
   */
  @Expose()
  @IsNumber()
  id: number;

  /**
   * The name of the category (e.g., "Work", "JavaScript").
   */
  @Expose()
  @IsString()
  name: string;


  /**
   * The user who owns this category.
   * The `@Type` decorator ensures the nested user object is correctly transformed.
   */
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  /**
   * Constructor to create a DTO instance from a partial Category entity.
   * @param category A partial Category object.
   */
  constructor(category: Partial<Category>) {
    Object.assign(this, category);
  }
}