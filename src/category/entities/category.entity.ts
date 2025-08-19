import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Snippet } from '../../snippet/entities/snippet.entity';

/**
 * Represents a Category entity in the database.
 * Each category is specific to a user and can contain multiple code snippets.
 */
@Entity('categories')
export class Category {
  /**
   * The unique identifier for the category.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The name of the category (e.g., "Work", "JavaScript").
   */
  @Column()
  name: string;

  /**
   * The date and time when the category was created.
   * This column is automatically set by TypeORM when a new category is saved.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The date and time when the category was last updated.
   * This column is automatically updated by TypeORM every time the entity is saved.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * The User entity that owns this category.
   * This is a Many-to-One relationship.
   */
  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * The foreign key column linking to the User entity.
   */
  @Column()
  userId: number;

  /**
   * An array of Snippet entities belonging to this category.
   * This is a One-to-Many relationship.
   */
  @OneToMany(() => Snippet, (snippet) => snippet.category)
  snippets: Snippet[];
}