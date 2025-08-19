import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from './UserResponseDto';
import { CategoryResponseDto } from './CategoryResponseDto';

/**
 * Data Transfer Object for a snippet response.
 * This class defines the structure of the data sent back to the client
 * after a snippet is retrieved, ensuring only exposed properties are included.
 */
@Exclude()
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
   * The date and time when the snippet was created.
   * This field is exposed to the client.
   */
  @Expose()
  createdAt: Date;

  /**
   * The date and time when the snippet was last updated.
   * This field is exposed to the client.
   */
  @Expose()
  updatedAt: Date;

  /**
   * The user who owns this snippet.
   * The `@Type` decorator ensures the nested user object is correctly transformed.
   */
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  /**
   * The category this snippet belongs to.
   * The `@Type` decorator ensures the nested category object is correctly transformed.
   */
  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;
}