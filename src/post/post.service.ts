import { ConflictException, Injectable } from '@nestjs/common';
import { supabase } from 'src/lib/db';
import { PostType } from 'src/lib/types/posts';

@Injectable()
export class PostService {
    async createPost(body:Pick<PostType,"title"|"content">){
        const {data,error} = await supabase.from("post").insert([{...body}]).select("*").single();
        if (error) {
            throw new ConflictException(error.message)
        }
        return {
            ok:true,
            message:"Your post was created successfully"
        }
    }
}
