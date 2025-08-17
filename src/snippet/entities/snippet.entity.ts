import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

/**
 * Represents a code snippet entity in the database.
 * Each snippet belongs to a user and can optionally be associated with a category.
 */
@Entity('snippets')
export class Snippet {
  /**
   * The unique identifier for the snippet.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The title of the code snippet.
   */
  @Column()
  title: string;

  /**
   * The actual code content of the snippet.
   */
  @Column()
  content: string;

  /**
   * The programming language of the snippet (e.g., 'javascript', 'python').
   */
  @Column()
  language: string;

  /**
   * The User entity that owns this snippet.
   * This is a Many-to-One relationship to the User entity.
   */
  @ManyToOne(() => User, user => user.snippets)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * The ID of the user who owns the snippet.
   * This column is excluded from the plain API response to avoid exposing internal foreign keys.
   */
  @Column()
  @Exclude({ toPlainOnly: true })
  userId: number;

  /**
   * The Category entity this snippet belongs to.
   * This is a Many-to-One relationship to the Category entity.
   */
  @ManyToOne(() => Category, category => category.snippets)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  /**
   * The ID of the category this snippet belongs to.
   * This column is also excluded from the plain API response.
   */
  @Column()
  @Exclude({ toPlainOnly: true })
  categoryId: number;
}