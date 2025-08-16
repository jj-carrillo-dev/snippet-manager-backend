import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { SnippetResponseDto } from './dto/snippet-response.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('snippet')
@UseGuards(AuthGuard('jwt')) // <-- Protects all routes in this controller
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Post()
  create(@Body() createSnippetDto: CreateSnippetDto, @Req() req: RequestWithUser): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.create(createSnippetDto, userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser): Promise<SnippetResponseDto[]> {
    const userId = req.user.id;
    return this.snippetService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
    @Req() req: RequestWithUser,
  ): Promise<SnippetResponseDto> {
    const userId = req.user.id;
    return this.snippetService.update(+id, updateSnippetDto, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.snippetService.remove(+id, userId);
  }

}