import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // Fallback added just in case
    });
  }

  async validate(payload: any) {
    // Support both 'sub' (standard) and 'userId' (custom) claims
    const id = payload.sub || payload.userId;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // FIXED: Removed "const { password, ...result } = user;"
    // Just return the user as-is since there is no password column.
    return user;
  }
}