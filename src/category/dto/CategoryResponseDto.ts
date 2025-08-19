import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';
import { UserResponseDto } from './UserResponseDto';

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
   * The ID of the user who owns the category.
   */
  @Exclude()
  @IsNumber()
  userId: number;

  /**
   * The user who owns this category.
   * The `@Type` decorator ensures the nested user object is correctly transformed.
   */
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;


  /**
   * The date and time when the category was created.
   * This field is exposed to the client.
   */
  @Expose()
  createdAt: Date;

  /**
   * The date and time when the category was last updated.
   * This field is exposed to the client.
   */
  @Expose()
  updatedAt: Date;

  /**
   * Constructor to create a DTO instance from a partial Category entity.
   * @param category A partial Category object.
   */
  constructor(category: Partial<Category>) {
    Object.assign(this, category);
  }
}