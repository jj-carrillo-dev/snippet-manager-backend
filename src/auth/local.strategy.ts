import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Passport strategy for local authentication (username and password).
 * This class extends the PassportStrategy from NestJS to define the validation logic.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Call the parent constructor to configure the strategy.
    // We specify 'username' as the field to look for in the request body,
    // overriding the default of 'email'.
    super({
      usernameField: 'username',
    });
  }

  /**
   * Validates the user's credentials.
   * This method is called by Passport during the authentication process.
   * @param username The username provided by the user.
   * @param pass The password provided by the user.
   * @returns A promise that resolves to the user object if validation is successful.
   * @throws UnauthorizedException if the user credentials are not valid.
   */
  async validate(username: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(username, pass);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}