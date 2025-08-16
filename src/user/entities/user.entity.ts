import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Snippet } from '../../snippet/entities/snippet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: false })
  username?: string;

  @Column()
  password?: string;

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @OneToMany(() => Snippet, snippet => snippet.user)
  snippets: Snippet[];
}