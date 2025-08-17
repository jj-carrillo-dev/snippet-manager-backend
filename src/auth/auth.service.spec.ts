import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

// Mock the dependencies
const mockUserService = () => ({
  findOneWithParams: jest.fn(), // <-- Updated to the correct method name
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      categories: [],
      snippets: []
    };

    let hashedPassword: string;

    beforeAll(async () => {
      hashedPassword = await bcrypt.hash(mockUser.password, 10);
      mockUser.password = hashedPassword;
    });

    it('should validate a user with correct credentials', async () => {
      // Correct Order: Mock the method before calling it
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(mockUser);

      // Call the method under test directly
      const user = await authService.validateUser(mockUser.username, 'password123');

      // Assert the expected outcome
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        categories: mockUser.categories,
        snippets: mockUser.snippets,
      });

      // Assert that the mocked method was called
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });

    it('should return null for an invalid password', async () => {
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(mockUser);
      const user = await authService.validateUser(mockUser.username, 'wrongpassword');
      expect(user).toBeNull();
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });

    it('should return null if user is not found', async () => {
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(null);
      const user = await authService.validateUser('nonexistent', 'password123');
      expect(user).toBeNull();
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a JWT access token', async () => {
      const mockPayload = { id: 1, email: 'test@example.com' };
      const expectedToken = { access_token: 'mock-jwt-token' };

      (jwtService.sign as jest.Mock).mockReturnValue(expectedToken.access_token);

      const result = await authService.login(mockPayload);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockPayload.email, sub: mockPayload.id });
      expect(result).toEqual(expectedToken);
    });
  });
});