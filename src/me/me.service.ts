/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as jose from 'jose';
import { supabase } from 'src/lib/db';
import UserType from 'src/lib/types/user';
@Injectable()
export class MeService {
  async getMe(token: string) {
    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
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

    const { data, error } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (error) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (data.length <= 0 || !data[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = data[0];

    return {
      ok: true,
      message: `User data fetched for ${user.name}`,
      user,
    };
  }
  async updateMe(token: string, body: UserType) {
    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
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

    const { data, error } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (error) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (data.length <= 0 || !data[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }
    const { data: dbData, error: err } = await supabase
      .from('user')
      .update({
        name: body.name,
        email: body.email,
        dob: body.dob,
        gender: body.gender,
        bio: body.bio,
        address: body.address,
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (err) {
      0;
      throw new UnprocessableEntityException(err.message);
    }
    console.log(dbData);

    const { password, ...user } = dbData;

    return {
      ok: true,
      message: `${dbData.name}'s profile is updated successfully`,
      user,
    };
  }

  async deleteMe(token: string) {
    let verifiedToken: any;
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
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

    const { data, error } = await supabase
      .from('user')
      .select()
      .eq('id', userId);

    if (error) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (data.length <= 0 || !data[0].password) {
      throw new UnauthorizedException('Unauthorized');
    }
    const { data: dbData, error: err } = await supabase
      .from('user')
      .delete()
      .eq('id', userId)
      .select('*')
      .single();
    if (err) {
      throw new ConflictException(err.message);
    }
    const { password, ...dataset } = dbData;
    return {
      ok: true,
      message: `${dataset.name} profile has been deleted`,
      user: dataset,
    };
  }
}
