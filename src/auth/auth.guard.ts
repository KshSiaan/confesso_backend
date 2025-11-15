import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jose from 'jose';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokenSecret = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
      throw new Error('TOKEN_SECRET not defined in environment variables');
    }

    const secret = new TextEncoder().encode(tokenSecret);

    let verifiedToken: jose.JWTVerifyResult;

    try {
      verifiedToken = await jose.jwtVerify(token, secret, {
        issuer: 'user',
        audience: 'user',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = verifiedToken.payload?.uid as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Optionally attach user info to request
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (request as any).user = { id: userId };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
