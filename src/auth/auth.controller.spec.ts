import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Mock the AuthService to isolate the controller and prevent it from calling real service logic.
const mockAuthService = () => ({
  validateUser: jest.fn(),
  login: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Set up the testing module and inject the mocked AuthService before each test.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // A simple test to verify that the controller is defined after setup.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the login endpoint.
  describe('login', () => {
    it('should call authService.login and return the access token', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const expectedToken = { access_token: 'mock-jwt-token' };

      // Mock the request object to simulate the user being authenticated and populated by the guard.
      const mockRequest = { user: user };

      // Mock the AuthService's login method to return a predefined token.
      (authService.login as jest.Mock).mockResolvedValue(expectedToken);

      // Call the login method with the mocked request object.
      const result = await controller.login(mockRequest as any);

      // Assert that the login method of the service was called with the user object from the request.
      expect(authService.login).toHaveBeenCalledWith(user);
      // Assert that the controller returns the token object provided by the service.
      expect(result).toEqual(expectedToken);
    });
  });
});