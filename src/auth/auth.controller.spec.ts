import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Mock the AuthService
const mockAuthService = () => ({
  validateUser: jest.fn(),
  login: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the access token', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const expectedToken = { access_token: 'mock-jwt-token' };

      // Mock the request object which is populated by the guard
      const mockRequest = { user: user };

      (authService.login as jest.Mock).mockResolvedValue(expectedToken);

      // We call the login method with the mocked request object
      const result = await controller.login(mockRequest as any);

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedToken);
    });
  });
});