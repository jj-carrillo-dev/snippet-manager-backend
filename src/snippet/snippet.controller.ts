import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { SnippetResponseDto } from './dto/snippet-response.dto';

@Controller('snippet')
@UseGuards(AuthGuard('jwt')) // <-- Protects all routes in this controller
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Post()
  create(@Body() createSnippetDto: CreateSnippetDto, @Request() req): Promise<SnippetResponseDto> {
    const userId = req.user.userId;
    return this.snippetService.create(createSnippetDto, userId);
  }

  @Get()
  findAll(@Request() req): Promise<SnippetResponseDto[]> {
    const userId = req.user.userId;
    return this.snippetService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<SnippetResponseDto> {
    const userId = req.user.userId;
    return this.snippetService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
    @Request() req,
  ): Promise<SnippetResponseDto> {
    const userId = req.user.userId;
    return this.snippetService.update(+id, updateSnippetDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.snippetService.remove(+id, userId);
  }
}