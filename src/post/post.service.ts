import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { supabase } from 'src/lib/db';
import { PostType } from 'src/lib/types/posts';
import * as jose from 'jose';
@Injectable()
export class PostService {
  async createPost(token: string, body: Pick<PostType, 'title' | 'content'>) {
    if (!body.title || !body.content) {
      throw new UnprocessableEntityException(
        'Please provide a valid title & content',
      );
    }

    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token_secret = process.env.TOKEN_SECRET!;
    const secret = new TextEncoder().encode(token_secret);
    try {
      verifiedToken = await jose.jwtVerify(token, secret, {
        issuer: 'user',
        audience: 'user',
      });
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string = verifiedToken.payload.uid;

    const { data: dbData, error: err } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (err) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (dbData.length <= 0 || !dbData[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { data, error } = await supabase
      .from('post')
      .insert([{ ...body, author_id: userId }])
      .select('*')
      .single();
    if (error) {
      throw new ConflictException(error.message);
    }
    return {
      ok: true,
      message: 'Your post was created successfully',
      post: data,
    };
  }
  async updatePost(
    token: string,
    id: string,
    body: Pick<PostType, 'title' | 'content'>,
  ) {
    if (!body.title || !body.content) {
      throw new UnprocessableEntityException(
        'Please provide valid title and content to update',
      );
    }

    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token_secret = process.env.TOKEN_SECRET!;
    const secret = new TextEncoder().encode(token_secret);
    try {
      verifiedToken = await jose.jwtVerify(token, secret, {
        issuer: 'user',
        audience: 'user',
      });
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string = verifiedToken.payload.uid;

    const { data: dbData, error: err } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (err) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (dbData.length <= 0 || !dbData[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { data: dbB, error: errB } = await supabase
      .from('post')
      .select('*')
      .eq('id', id)
      .single();

    if (errB) {
      throw new NotFoundException(errB.message);
    }
    if (userId !== dbB.author_id) {
      throw new UnauthorizedException("You're not the owner of this post");
    }

    const { data, error } = await supabase
      .from('post')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new ConflictException(error.message);
    }
    return {
      ok: true,
      message: 'Your post updated successfully',
      post: data,
    };
  }
  async deletePost(token: string, id: string) {
    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token_secret = process.env.TOKEN_SECRET!;
    const secret = new TextEncoder().encode(token_secret);
    try {
      verifiedToken = await jose.jwtVerify(token, secret, {
        issuer: 'user',
        audience: 'user',
      });
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string = verifiedToken.payload.uid;

    const { data: dbData, error: err } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (err) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (dbData.length <= 0 || !dbData[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(error.message);
    }
    if (userId !== data.author_id) {
      throw new UnauthorizedException("You're not the owner of this post");
    }

    const { data: dbDataB, error: errB } = await supabase
      .from('post')
      .delete()
      .eq('id', id)
      .select('*')
      .single();
    if (errB) {
      throw new ConflictException(errB.message);
    }
    return {
      ok: true,
      message: `Post ${dbDataB?.title} has been deleted`,
      post: dbDataB,
    };
  }
}
