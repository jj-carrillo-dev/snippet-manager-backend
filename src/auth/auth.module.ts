import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // Imports the UserModule to allow the AuthService to use the UserService.
    UserModule,
    // PassportModule is required for implementing authentication strategies.
    PassportModule,
    // JwtModule is configured asynchronously to use the ConfigService.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Retrieves the secret key from environment variables for security.
        secret: configService.get<string>('JWT_SECRET_KEY'),
        // Sets the token expiration time to 1 hour (3600 seconds).
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // Provides the local authentication strategy.
    JwtStrategy,   // Provides the JWT authentication strategy.
  ],
  // Exports the AuthService and JwtModule so they can be used by other modules (e.g., in other guards).
  exports: [AuthService, JwtModule],
})
export class AuthModule {}