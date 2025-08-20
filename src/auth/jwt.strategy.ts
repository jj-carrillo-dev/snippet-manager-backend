import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { UserResponseDto } from 'src/user/dto/UserResponseDto';

/**
 * Passport strategy for JWT authentication.
 * This strategy extracts the JWT from the Authorization header and validates it.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private userService: UserService) {
    // Get the JWT secret key from environment variables.
    const jwtSecretKey = configService.get<string>('JWT_SECRET_KEY');
    if (!jwtSecretKey) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }
    
    // Call the parent constructor to configure the strategy.
    super({
      // Specifies how the JWT is extracted from the request.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // We let the library handle token expiration.
      ignoreExpiration: false,
      // The secret key used to sign the JWT.
      secretOrKey: jwtSecretKey,
    });
  }

  /**
   * Validates the JWT payload and returns the corresponding user.
   * This method is called after the JWT has been validated by the strategy.
   * @param payload The decoded JWT payload.
   * @returns A promise that resolves to the user object.
   * @throws UnauthorizedException if the user does not exist.
   */
  async validate(payload: any): Promise<UserResponseDto> {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}