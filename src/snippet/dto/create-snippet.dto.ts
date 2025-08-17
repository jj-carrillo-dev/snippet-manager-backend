import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new code snippet.
 * This class defines the validation rules for the data submitted to the API.
 */
export class CreateSnippetDto {
  /**
   * The title of the snippet.
   * It must be a non-empty string with a length between 3 and 200 characters.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3) // Min length of 3 characters
  @MaxLength(200) // Max length of 200 characters
  title: string;

  /**
   * The actual code content of the snippet.
   * It must be a non-empty string with a length between 10 and 5000 characters.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(10) // Min length of 10 characters
  @MaxLength(5000) // Max length of 5000 characters
  content: string;

  /**
   * The programming language of the snippet.
   * It must be a non-empty string with a length between 2 and 50 characters.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(2) // Min length of 2 characters
  @MaxLength(50) // Max length of 50 characters
  language: string;

  /**
   * The ID of the category this snippet belongs to.
   * This field is required and must be a number.
   */
  @IsNotEmpty()
  categoryId: number;
}