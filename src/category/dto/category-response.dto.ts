import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsNumber()
  userId: number;

  constructor(category: Partial<Category>) {
    Object.assign(this, category);
  }
}