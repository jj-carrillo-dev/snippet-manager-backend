import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnippetService } from './snippet.service';
import { SnippetController } from './snippet.controller';
import { Snippet } from './entities/snippet.entity';
import { CategoryModule } from '../category/category.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet]), CategoryModule, UserModule],
  controllers: [SnippetController],
  providers: [SnippetService],
})
export class SnippetModule {}