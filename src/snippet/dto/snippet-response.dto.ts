import { Expose, Type } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

export class SnippetResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  language: string;

  @Expose()
  @Type(() => User)
  user: User;

  @Expose()
  @Type(() => Category)
  category: Category;
}