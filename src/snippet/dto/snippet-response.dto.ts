import { Expose, Type } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

/**
 * Data Transfer Object for a snippet response.
 * This class defines the structure of the data sent back to the client
 * after a snippet is retrieved, ensuring only exposed properties are included.
 */
export class SnippetResponseDto {
  /**
   * The unique identifier of the snippet.
   */
  @Expose()
  id: number;

  /**
   * The title of the snippet.
   */
  @Expose()
  title: string;

  /**
   * The code content of the snippet.
   */
  @Expose()
  content: string;

  /**
   * The programming language of the snippet.
   */
  @Expose()
  language: string;

  /**
   * The user who owns this snippet.
   * The `@Type` decorator ensures the nested user object is correctly transformed.
   */
  @Expose()
  @Type(() => User)
  user: User;

  /**
   * The category this snippet belongs to.
   * The `@Type` decorator ensures the nested category object is correctly transformed.
   */
  @Expose()
  @Type(() => Category)
  category: Category;
}