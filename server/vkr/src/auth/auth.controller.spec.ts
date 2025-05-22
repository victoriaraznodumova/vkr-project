// src/auth/auth2.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDto } from '../users/dto/user.dto'; // Предполагается, что это структура DTO
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entity/user.entity'; // Предполагается, что это структура сущности User
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ExecutionContext, CanActivate, UnauthorizedException, ConflictException, NotFoundException, CallHandler } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { of } from 'rxjs';

// --- Мок-классы для гвардов ---
// Теперь canActivate - это напрямую Jest-мок-функция
class MockJwtAuthGuard implements CanActivate {
  canActivate = jest.fn((context: ExecutionContext) => {
    // По умолчанию разрешаем доступ и мокируем req.user
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 1, email: 'test@example.com' };
    return true;
  });
}

class MockLocalAuthGuard implements CanActivate {
  canActivate = jest.fn((context: ExecutionContext) => {
    // По умолчанию разрешаем доступ и мокируем req.user
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 1, email: 'test@example.com' };
    return true;
  });
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtAuthGuard: MockJwtAuthGuard; // Переменная для экземпляра мок-гварда
  let localAuthGuard: MockLocalAuthGuard; // Переменная для экземпляра мок-гварда

  // Общие моки для User Entity, которые будут использоваться в тестах
  const mockUserEntityBase: User = {
    userId: 1,
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    registrationDate: new Date('2025-05-22T01:44:50.962Z'),
    administrators: [],
    entries: [],
    initiatedEvents: [],
    passwordResetTokens: [],
    queues: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            requestPasswordReset: jest.fn(),
            confirmPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: ClassSerializerInterceptor,
          useValue: {
            intercept: jest.fn((context: ExecutionContext, next: CallHandler) => {
              return next.handle();
            }),
          },
        },
      ],
    })
      // Переопределяем реальные гварды нашими мок-классами
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .overrideGuard(LocalAuthGuard).useClass(MockLocalAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    // Получаем экземпляры наших мок-гвардов из тестового модуля
    jwtAuthGuard = module.get<MockJwtAuthGuard>(JwtAuthGuard);
    localAuthGuard = module.get<MockLocalAuthGuard>(LocalAuthGuard);


    // Очищаем все моки перед каждым тестом.
    // Это очистит и моки сервисов, и моки canActivate внутри наших мок-гвардов.
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('должен зарегистрировать пользователя и вернуть UserDto', async () => {
      const registerDto: RegisterUserDto = {
        email: 'new@example.com',
        password: 'password123',
      };
      const expectedUserEntityFromService: User = {
        ...mockUserEntityBase,
        userId: 2,
        email: registerDto.email,
        passwordHash: 'hashedpassword',
        registrationDate: new Date(),
      };

      jest.spyOn(service, 'register').mockResolvedValue(expectedUserEntityFromService);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expect.objectContaining({
        userId: expectedUserEntityFromService.userId,
        email: expectedUserEntityFromService.email,
        passwordHash: expectedUserEntityFromService.passwordHash,
        registrationDate: expect.any(Date),
        administrators: expect.any(Array),
        entries: expect.any(Array),
        initiatedEvents: expect.any(Array),
        passwordResetTokens: expect.any(Array),
        queues: expect.any(Array),
      }));
    });

    it('должен выбросить ConflictException, если email уже существует', async () => {
      const registerDto: RegisterUserDto = {
        email: 'existing@example.com',
        password: 'password123',
      };
      jest.spyOn(service, 'register').mockRejectedValue(new ConflictException('Пользователь с таким email уже существует.'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('должен успешно аутентифицировать пользователя и вернуть accessToken', async () => {
      const loginData: LoginUserDto = { email: 'test@example.com', password: 'password123' };
      const userFromGuard: User = {
        ...mockUserEntityBase,
        userId: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      };
      const expectedResult = { accessToken: 'some-jwt-token' };

      // Мокируем поведение canActivate для LocalAuthGuard
      localAuthGuard.canActivate.mockImplementation((context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = userFromGuard;
        return true;
      });
      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login({ user: {} as User }, loginData);

      expect(localAuthGuard.canActivate).toHaveBeenCalled(); // Проверяем вызов canActivate на экземпляре мок-гварда
      expect(service.login).toHaveBeenCalledWith(userFromGuard);
      expect(result).toEqual(expectedResult);
    });

    it('должен выбросить UnauthorizedException при неудачной аутентификации (обработано гвардом)', async () => {
      // Мокируем поведение canActivate для LocalAuthGuard, чтобы он выбрасывал исключение
      localAuthGuard.canActivate.mockImplementation((context: ExecutionContext) => {
        throw new UnauthorizedException('Неверные учетные данные.');
      });

      const loginData: LoginUserDto = { email: 'wrong@example.com', password: 'wrongpassword' };
      await expect(controller.login({ user: null }, loginData)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('должен вернуть профиль аутентифицированного пользователя', async () => {
      const userFromGuard: User = {
        ...mockUserEntityBase,
        userId: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      };
      const mockUserDtoResult: User = {
        userId: userFromGuard.userId,
        email: userFromGuard.email,
        passwordHash: userFromGuard.passwordHash,
        registrationDate: userFromGuard.registrationDate,
        administrators: userFromGuard.administrators,
        entries: userFromGuard.entries,
        initiatedEvents: userFromGuard.initiatedEvents,
        passwordResetTokens: userFromGuard.passwordResetTokens,
        queues: userFromGuard.queues,
      };

      // Мокируем поведение canActivate для JwtAuthGuard
      jwtAuthGuard.canActivate.mockImplementation((context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = userFromGuard;
        return true;
      });

      const request = { user: {} as User } as any;
      const result = await controller.getProfile(request);

      expect(jwtAuthGuard.canActivate).toHaveBeenCalled(); // Проверяем вызов canActivate на экземпляре мок-гварда
      expect(result).toEqual(mockUserDtoResult);
    });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обработано гвардом)', async () => {
      // Мокируем поведение canActivate для JwtAuthGuard, чтобы он выбрасывал исключение
      jwtAuthGuard.canActivate.mockImplementation((context: ExecutionContext) => {
        throw new UnauthorizedException('Не авторизован.');
      });

      await expect(controller.getProfile({ user: null })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordReset', () => {
    it('должен успешно запросить сброс пароля', async () => {
      const requestDto: RequestPasswordResetDto = { email: 'user@example.com' };
      jest.spyOn(service, 'requestPasswordReset').mockResolvedValue(undefined);

      const result = await controller.requestPasswordReset(requestDto);

      expect(service.requestPasswordReset).toHaveBeenCalledWith(requestDto);
      expect(result).toEqual({ message: 'Код для восстановления пароля отправлен на email.' });
    });

    it('должен обработать NotFoundException, если email не найден', async () => {
      const requestDto: RequestPasswordResetDto = { email: 'nonexistent@example.com' };
      jest.spyOn(service, 'requestPasswordReset').mockRejectedValue(new NotFoundException('Пользователь с таким email не найден.'));

      await expect(controller.requestPasswordReset(requestDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmPasswordReset', () => {
    it('должен успешно подтвердить сброс пароля', async () => {
      const confirmDto: ConfirmPasswordResetDto = {
        email: 'user@example.com',
        code: '123456',
      };
      jest.spyOn(service, 'confirmPasswordReset').mockResolvedValue(undefined);

      const result = await controller.confirmPasswordReset(confirmDto);

      expect(service.confirmPasswordReset).toHaveBeenCalledWith(confirmDto);
      expect(result).toEqual({ message: 'Код подтверждения верен. Теперь вы можете установить новый пароль.' });
    });

    it('должен обработать NotFoundException, если код недействителен или истек', async () => {
      const confirmDto: ConfirmPasswordResetDto = {
        email: 'user@example.com',
        code: 'invalid-code',
      };
      jest.spyOn(service, 'confirmPasswordReset').mockRejectedValue(new NotFoundException('Неверный или истекший код подтверждения.'));

      await expect(controller.confirmPasswordReset(confirmDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('должен успешно сбросить пароль и вернуть UserDto', async () => {
      const resetDto: ResetPasswordDto = {
        email: 'test@example.com',
        code: '123456',
        newPassword: 'newpassword',
        confirmNewPassword: 'newpassword',
      };
      const expectedUserEntityFromService: User = {
        ...mockUserEntityBase,
        userId: 1,
        email: resetDto.email,
        passwordHash: 'newhashedpassword',
        registrationDate: new Date(),
      };

      jest.spyOn(service, 'resetPassword').mockResolvedValue(expectedUserEntityFromService);

      const result = await controller.resetPassword(resetDto);

      expect(service.resetPassword).toHaveBeenCalledWith(resetDto);
      expect(result).toEqual(expect.objectContaining({
        userId: expectedUserEntityFromService.userId,
        email: expectedUserEntityFromService.email,
        passwordHash: expectedUserEntityFromService.passwordHash,
        registrationDate: expect.any(Date),
        administrators: expect.any(Array),
        entries: expect.any(Array),
        initiatedEvents: expect.any(Array),
        passwordResetTokens: expect.any(Array),
        queues: expect.any(Array),
      }));
    });

    it('должен обработать NotFoundException, если данные для сброса недействительны', async () => {
      const resetDto: ResetPasswordDto = {
        email: 'user@example.com',
        code: 'invalid-code',
        newPassword: 'newPassword123',
        confirmNewPassword: 'newPassword123',
      };
      jest.spyOn(service, 'resetPassword').mockRejectedValue(new NotFoundException('Неверный или истекший код подтверждения.'));

      await expect(controller.resetPassword(resetDto)).rejects.toThrow(NotFoundException);
    });
  });
});
