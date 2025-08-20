import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Snippet } from '../../snippet/entities/snippet.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a user entity in the application.
 * This entity maps to the 'users' table in the database.
 */
@Entity('users')
export class User {
  /**
   * The unique numerical identifier for the user.
   * This is the primary key and is auto-generated.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The globally unique identifier (GUID) for the user.
   * This is used for public-facing API routes to prevent ID enumeration attacks.
   * It is automatically generated before a new user is inserted into the database.
   */
  @Column({ unique: true })
  guid: string;

  /**
   * The user's email address.
   * This column is unique to ensure no two users share the same email.
   */
  @Column({ unique: true })
  email: string;

  /**
   * The user's username.
   * This is a unique, non-nullable column.
   */
  @Column({ unique: true, nullable: false })
  username?: string;

  /**
   * The user's password hash.
   * This column stores the hashed password for security.
   */
  @Column()
  password?: string;

  /**
   * The date and time when the user was created.
   * This column is automatically set by TypeORM when a new user is saved.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The date and time when the user was last updated.
   * This column is automatically updated by TypeORM every time the entity is saved.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * A one-to-many relationship with the Category entity.
   * This links a user to all the categories they have created.
   */
  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  /**
   * A one-to-many relationship with the Snippet entity.
   * This links a user to all the snippets they have created.
   */
  @OneToMany(() => Snippet, (snippet) => snippet.user)
  snippets: Snippet[];

  /**
   * A TypeORM decorator that runs before a new user is inserted into the database.
   * It generates a unique UUID and assigns it to the 'guid' property.
   */
  @BeforeInsert()
  generateGuid() {
    this.guid = uuidv4();
  }
}