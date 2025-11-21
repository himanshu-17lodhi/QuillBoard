import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid'; // We will use this, or a simple random string

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // FIXED: validateUser now only takes email (removed password)
  async validateUser(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, name: string) {
    return this.prisma.user.create({
      data: {
        // FIXED: Manually generating an ID to satisfy Prisma
        id: uuidv4(), 
        email,
        name,
      },
    });
  }
}