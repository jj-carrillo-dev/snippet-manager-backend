import { Controller, Request, Post, UseGuards, Req, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user login and provides a JWT upon successful authentication.
   * This endpoint is protected by the LocalAuthGuard, which validates user credentials.
   * @param req The request object, populated with the validated user by the LocalAuthGuard.
   * @returns An object containing the JWT access token.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // The LocalAuthGuard automatically authenticates the user and attaches the user object to the request.
    return this.authService.login(req.user);
  }
}