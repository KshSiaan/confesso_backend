import { Body, Controller, Post } from '@nestjs/common';
import type { PostType } from 'src/lib/types/posts';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
      constructor(private readonly PostService:PostService ) {}
    @Post()
    async createPost(@Body()body:Pick<PostType,"title"|"content">) {
        return this.PostService.createPost(body)
    }
}
