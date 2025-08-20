import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Snippet } from './entities/snippet.entity';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { CategoryService } from '../category/category.service';
import { SnippetResponseDto } from './dto/SnippetResponseDto';
import { UserService } from 'src/user/user.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SnippetService {
  constructor(
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
    private categoryService: CategoryService,
    private userService: UserService,
  ) { }

  /**
   * Creates a new code snippet.
   * @param createSnippetDto The data for the new snippet.
   * @param userId The ID of the user creating the snippet.
   * @returns A promise that resolves to the newly created snippet response DTO.
   */
  async create(createSnippetDto: CreateSnippetDto, userId: number): Promise<SnippetResponseDto> {

    let snippetWithRelations: Snippet | null = null;
    try {
      const { categoryId, ...snippetData } = createSnippetDto;
      // Verify the category exists and belongs to the user
      const category = await this.categoryService.findOne(categoryId, userId);
      
      if (!category) {
        throw new NotFoundException('Category not found or you do not have permission to use it');
      }

      // Create a new snippet instance with the correct relationships
      const newSnippet = this.snippetRepository.create({
        ...snippetData,
        user: { id: userId },
        category: { id: categoryId },
      });
      
      // Save the snippet and load the related user and category in one go
      const savedSnippet = await this.snippetRepository.save(newSnippet);
      
      // Find the newly created snippet with its full relations to return a complete DTO
      snippetWithRelations = await this.snippetRepository.findOne({
        where: { id: savedSnippet.id },
        relations: ['user', 'category'],
      });
      
    } catch (error) {
      throw new NotFoundException('Error creating snippet: ' + error.message);
    }

    if (!snippetWithRelations) {
      throw new NotFoundException('Snippet not found after creation');
    }
    
    // Use plainToInstance to create the DTO from the entity
    return plainToInstance(SnippetResponseDto, snippetWithRelations);
  }

  /**
   * Finds all snippets for a specific user.
   * @param userId The ID of the user to find snippets for.
   * @returns A promise that resolves to an array of snippet response DTOs.
   */
  async findAll(userId: number): Promise<SnippetResponseDto[]> {
    const snippets = await this.snippetRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'category'],
    });

    const result = snippets.map(snippet => plainToInstance(SnippetResponseDto, snippet));
    return result;
  }

  /**
   * Finds a single snippet by its ID and user ID.
   * Throws a NotFoundException if the snippet is not found or doesn't belong to the user.
   * @param id The ID of the snippet to find.
   * @param userId The ID of the user requesting the snippet.
   * @returns A promise that resolves to the found snippet response DTO.
   */
  async findOne(id: number, userId: number): Promise<SnippetResponseDto> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'category'],
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to view it');
    }

    return plainToInstance(SnippetResponseDto, snippet);
  }

  /**
   * Updates an existing snippet.
   * Verifies the snippet belongs to the user and updates its properties.
   * Can also change the snippet's category if a valid categoryId is provided.
   * @param id The ID of the snippet to update.
   * @param updateSnippetDto The data to update the snippet with.
   * @param userId The ID of the user performing the update.
   * @returns A promise that resolves to the updated snippet response DTO.
   */
  async update(id: number, updateSnippetDto: UpdateSnippetDto, userId: number): Promise<SnippetResponseDto> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'category'], // Include relations for a complete response
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to update it');
    }

    // If a new category is specified, find and validate it
    if (updateSnippetDto.categoryId) {
      const category = await this.categoryService.findOneCategory(updateSnippetDto.categoryId, userId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      snippet.category = category;
      // Remove categoryId from the DTO to prevent a TypeORM error
      delete updateSnippetDto.categoryId;
    }

    // Update the snippet with the remaining DTO properties
    Object.assign(snippet, updateSnippetDto);

    const updatedSnippet = await this.snippetRepository.save(snippet);

    return plainToInstance(SnippetResponseDto, updatedSnippet);
  }

  /**
   * Removes a snippet from the database.
   * Ensures the snippet belongs to the user before deletion.
   * @param id The ID of the snippet to remove.
   * @param userId The ID of the user performing the removal.
   * @returns A promise that resolves to a TypeORM DeleteResult.
   */
  async remove(id: number, userId: number): Promise<DeleteResult> {
    const snippet = await this.snippetRepository.findOne({ where: { id, user: { id: userId } } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found or you do not have permission to remove it');
    }
    return this.snippetRepository.delete(snippet.id);
  }
}