import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

// Mock the UserService to isolate the AuthService logic during unit tests.
const mockUserService = () => ({
  findOneWithParams: jest.fn(),
});

// Mock the JwtService to control the token signing process without a real secret key.
const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Set up the testing module and inject mocked dependencies.
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

  // Simple test to ensure the service is correctly defined.
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // Test suite for the `validateUser` method, which is a core authentication logic.
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

    // Hash the mock user's password once before all tests in this suite.
    beforeAll(async () => {
      hashedPassword = await bcrypt.hash(mockUser.password, 10);
      mockUser.password = hashedPassword;
    });

    it('should validate a user with correct credentials', async () => {
      // Mock the `userService` to return a user with a hashed password.
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(mockUser);

      // Call the `validateUser` method with the plain-text password.
      const user = await authService.validateUser(mockUser.username, 'password123');

      // Assert that the returned user object has the password excluded.
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        categories: mockUser.categories,
        snippets: mockUser.snippets,
      });

      // Assert that the mocked user service method was called.
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });

    it('should return null for an invalid password', async () => {
      // Mock the `userService` to find the user.
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(mockUser);
      // Attempt to validate with a wrong password.
      const user = await authService.validateUser(mockUser.username, 'wrongpassword');
      // Verify that `null` is returned when password comparison fails.
      expect(user).toBeNull();
      // Verify that the user service was still called.
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });

    it('should return null if user is not found', async () => {
      // Mock the `userService` to return null, simulating a user not found.
      (userService.findOneWithParams as jest.Mock).mockResolvedValue(null);
      // Attempt to validate with a non-existent username.
      const user = await authService.validateUser('nonexistent', 'password123');
      // Verify that `null` is returned immediately.
      expect(user).toBeNull();
      // Verify the user service was called to check for the user.
      expect(userService.findOneWithParams).toHaveBeenCalled();
    });
  });

  // Test suite for the `login` method.
  describe('login', () => {
    it('should return a JWT access token', async () => {
      const mockPayload = { id: 1, email: 'test@example.com' };
      const expectedToken = { access_token: 'mock-jwt-token' };

      // Mock the `jwtService.sign` method to return a dummy token string.
      (jwtService.sign as jest.Mock).mockReturnValue(expectedToken.access_token);

      const result = await authService.login(mockPayload);

      // Assert that the `sign` method was called with the correct payload.
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockPayload.email, sub: mockPayload.id });
      // Assert that the `login` method returns the expected object with the access token.
      expect(result).toEqual(expectedToken);
    });
  });
});