/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { supabase } from 'src/lib/db';
import * as bcrypt from 'bcrypt';
import * as jose from 'jose';
@Controller('login')
export class LoginController {
  @Post()
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    if (!email || !password) {
      throw new UnprocessableEntityException('Invalid login dataset');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .single();
    if (error) {
      console.log(error);

      throw new BadRequestException('Invalid login attempt');
    }
    if (data.length <= 0 || !data.email || !data.password) {
      console.log(error);

      throw new BadRequestException('Invalid login attempt');
    }

    const passIsOk = await bcrypt.compare(password, data.password);

    if (!passIsOk) {
      console.log('++++');
      console.log(data.password);
      console.log('++++');
      console.log(password);
      console.log('++++');

      throw new BadRequestException('Invalid login attempt xx');
    }

    const userPayload = {
      name: data.name,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
      bio: data.bio,
      address: data.address,
      role: data.role,
    };

    const token_secret = process.env.TOKEN_SECRET!;
    const secret = new TextEncoder().encode(token_secret);

    const alg = 'HS256';

    const jwt = await new jose.SignJWT({ uid: data.id })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('user')
      .setAudience('user')
      .setExpirationTime('3d')
      .sign(secret);
    let message = 'You have successfully logged in';
    if (data.role === 'admin' && data.name !== 'Raven') {
      message = 'Welcome home, Queen Victoria';
    }
    return { ok: true, message, user: userPayload, jwt_token: jwt };
  }
}
