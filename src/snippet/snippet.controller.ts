import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { SnippetResponseDto } from './dto/SnippetResponseDto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('snippets')
@UseGuards(AuthGuard('jwt')) // Protect all routes in this controller with JWT authentication
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  /**
   * Creates a new snippet for the authenticated user.
   * @param createSnippetDto The data for the new snippet.
   * @param req The request object, containing the authenticated user's details.
   * @returns A promise that resolves to the newly created snippet.
   */
  @Post()
  create(@Body() createSnippetDto: CreateSnippetDto, @Req() req: RequestWithUser): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.create(createSnippetDto, userId);
  }

  /**
   * Retrieves all snippets belonging to the authenticated user.
   * @param req The request object, containing the authenticated user's details.
   * @returns A promise that resolves to an array of snippet response objects.
   */
  @Get()
  findAll(@Req() req: RequestWithUser): Promise<SnippetResponseDto[]> {
    const userId = req.user.id;
    return this.snippetService.findAll(userId);
  }

  /**
   * Finds a specific snippet by ID for the authenticated user.
   * @param id The ID of the snippet to find.
   * @param req The request object, containing the authenticated user's details.
   * @returns A promise that resolves to the found snippet response object.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.findOne(+id, userId);
  }

  /**
   * Updates an existing snippet for the authenticated user.
   * @param id The ID of the snippet to update.
   * @param updateSnippetDto The data to update the snippet with.
   * @param req The request object, containing the authenticated user's details.
   * @returns A promise that resolves to the updated snippet response object.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
    @Req() req: RequestWithUser,
  ): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.update(+id, updateSnippetDto, userId);
  }

  /**
   * Deletes a snippet by ID for the authenticated user.
   * The response status is 204 No Content upon successful deletion.
   * @param id The ID of the snippet to delete.
   * @param req The request object, containing the authenticated user's details.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.snippetService.remove(+id, userId);
  }
}