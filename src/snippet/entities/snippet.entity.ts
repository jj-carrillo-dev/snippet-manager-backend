import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('snippets')
export class Snippet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  language: string;

  @ManyToOne(() => User, user => user.snippets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Exclude({ toPlainOnly: true }) // <-- Excludes userId from the API response
  userId: number;

  @ManyToOne(() => Category, category => category.snippets)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  @Exclude({ toPlainOnly: true }) // <-- Excludes categoryId from the API response
  categoryId: number;
}