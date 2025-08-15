import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3) // Min length of 3 characters
  @MaxLength(200) // Max length of 200 characters
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10) // Min length of 10 characters
  @MaxLength(5000) // Max length of 5000 characters
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2) // Min length of 2 characters
  @MaxLength(50) // Max length of 50 characters
  language: string;

  @IsNotEmpty()
  categoryId: number;
}