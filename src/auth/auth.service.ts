import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials by checking their email or username and password.
   * This method is used by the LocalStrategy during authentication.
   * @param emailOrUsername The user's email or username.
   * @param pass The user's password.
   * @returns A promise that resolves to the user object (without the password) if valid, otherwise null.
   */
  async validateUser(emailOrUsername: string, pass: string): Promise<any> {
    // Find the user by either email or username using an array in the where clause.
    const user = await this.userService.findOneWithParams({
      where: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ] as FindOptionsWhere<User>,
    });

    // Compare the provided password with the stored hashed password.
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // Exclude the password from the returned object for security.
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generates a JSON Web Token (JWT) for a valid user.
   * The JWT payload contains the user's email and ID.
   * @param user The user object to generate the token for.
   * @returns An object containing the generated access token.
   */
  async login(user: any) {

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}