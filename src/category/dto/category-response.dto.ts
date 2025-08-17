import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

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
  @Expose()
  @IsNumber()
  userId: number;

  /**
   * Constructor to create a DTO instance from a partial Category entity.
   * @param category A partial Category object.
   */
  constructor(category: Partial<Category>) {
    Object.assign(this, category);
  }
}