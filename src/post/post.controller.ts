import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { PostType } from 'src/lib/types/posts';
import { PostService } from './post.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { supabase } from 'src/lib/db';

@Controller('post')
export class PostController {
  constructor(private readonly PostService: PostService) {}

  @Get()
  async getPosts() {
    const { data, error } = await supabase.from('post').select('*').eq("isPrivate",false);

    if (error) {
      throw new BadRequestException(error.message);
    }
    return {
      ok: true,
      message: 'Posts fetched successfully',
      data,
    };
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async getPost(@Param('id') id: string) {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }
    return {
      ok: true,
      message: 'Posts fetched successfully',
      data,
    };
  }
  @Post()
  async createPost(
    @Headers('authorization') authHeader: string,
    @Body() body: Pick<PostType, 'title' | 'content'|"isPrivate">,
  ) {
    const token = authHeader?.split(' ')[1];
    return this.PostService.createPost(token, body);
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() body: Pick<PostType, 'title' | 'content'|"isPrivate">,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    return this.PostService.updatePost(token, id, body);
  }
  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    return this.PostService.deletePost(token, id);
  }
}
