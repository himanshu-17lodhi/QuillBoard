import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { LocalAuthGuard } from './local-auth.guard'; // Not needed for Supabase

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // We remove the LocalAuthGuard because Supabase handles login
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    // Removed @Body('password') because we don't store it
    @Body('name') name: string,
  ) {
    // FIXED: Only passing 2 arguments now (email, name)
    return this.authService.register(email, name);
  }
}