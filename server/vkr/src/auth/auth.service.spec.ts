// src/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // Импортируем bcrypt для мокирования

// --- Моки для зависимостей ---
const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(), // Добавлено для getAuthenticatedUser
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockPasswordResetTokensService = {
  createToken: jest.fn(),
  sendPasswordResetCode: jest.fn(),
  findValidToken: jest.fn(),
  invalidateToken: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'test_jwt_secret';
    return null;
  }),
};

// Мокируем bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string, saltRounds: number) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => Promise.resolve(password === hash.replace('hashed_', ''))),
}));


// --- Мок-объекты сущностей и DTO ---
const mockUser: User = {
  userId: 1,
  email: 'test@example.com',
  passwordHash: 'hashed_password123',
  registrationDate: new Date(),
  entries: [], administrators: [], queues: [], initiatedEvents: [], passwordResetTokens: [],
};

const mockUserWithoutHash: User = {
  userId: 1,
  email: 'test@example.com',
  passwordHash: undefined, // Для сценария, когда хеш отсутствует
  registrationDate: new Date(),
  entries: [], administrators: [], queues: [], initiatedEvents: [], passwordResetTokens: [],
};


const mockRegisterDto: RegisterUserDto = {
  email: 'newuser@example.com',
  password: 'newpassword123',
};

const mockLoginDto: LoginUserDto = {
  email: 'test@example.com',
  password: 'password123',
};

const mockResetToken: PasswordResetToken = {
  id: 1,
  token: '123456',
  expiresAt: new Date(Date.now() + 3600000), // 1 час в будущем
  isValid: true,
  createdAt: new Date(),
  userId: mockUser.userId,
  user: mockUser,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PasswordResetTokensService, useValue: mockPasswordResetTokensService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks(); // Очищаем моки перед каждым тестом
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для register ---
  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserService.findByEmail.mockResolvedValue(undefined); // Пользователь не существует
      mockUserService.create.mockResolvedValue(mockUser); // Создаем пользователя

      const result = await service.register(mockRegisterDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockRegisterDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...mockRegisterDto,
        passwordHash: `hashed_${mockRegisterDto.password}`,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user with email already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser); // Пользователь уже существует

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        new BadRequestException('Пользователь с таким email уже существует'),
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockRegisterDto.email);
      expect(bcrypt.hash).not.toHaveBeenCalled(); // Хеширование не должно вызываться
      expect(mockUserService.create).not.toHaveBeenCalled(); // Создание не должно вызываться
    });
  });

  // --- Тесты для validateUser ---
  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser); // Пользователь найден
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Пароль совпадает

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...expectedUser } = mockUser; // Ожидаем пользователя без хеша

      const result = await service.validateUser(mockLoginDto.email, mockLoginDto.password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginDto.password, mockUser.passwordHash);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(undefined); // Пользователь не найден

      const result = await service.validateUser(mockLoginDto.email, mockLoginDto.password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Сравнение не должно вызываться
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser); // Пользователь найден
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Пароль не совпадает

      const result = await service.validateUser(mockLoginDto.email, 'wrongpassword');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
      expect(result).toBeNull();
    });

    it('should return null if user has no password hash', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUserWithoutHash); // Пользователь без хеша

      const result = await service.validateUser(mockLoginDto.email, mockLoginDto.password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Сравнение не должно вызываться
      expect(result).toBeNull();
    });
  });

  // --- Тесты для login ---
  describe('login', () => {
    it('should generate an access token for a valid user', async () => {
      const payload = { email: mockUser.email, sub: mockUser.userId };
      mockJwtService.sign.mockReturnValue('mockAccessToken');

      const result = await service.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });
  });

  // --- Тесты для getAuthenticatedUser ---
  describe('getAuthenticatedUser', () => {
    it('should return user if found by ID', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await service.getAuthenticatedUser(mockUser.userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findOne.mockResolvedValue(undefined);

      await expect(service.getAuthenticatedUser(999)).rejects.toThrow(
        new UnauthorizedException('Пользователь не найден'),
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith(999);
    });
  });

  // --- Тесты для requestPasswordReset ---
  describe('requestPasswordReset', () => {
    const requestDto: RequestPasswordResetDto = { email: 'test@example.com' };
    const nonExistentRequestDto: RequestPasswordResetDto = { email: 'nonexistent@example.com' };

    it('should create token and send email if user exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokensService.createToken.mockResolvedValue(mockResetToken);
      mockPasswordResetTokensService.sendPasswordResetCode.mockResolvedValue(undefined);

      await service.requestPasswordReset(requestDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(requestDto.email);
      expect(mockPasswordResetTokensService.createToken).toHaveBeenCalledWith(mockUser);
      expect(mockPasswordResetTokensService.sendPasswordResetCode).toHaveBeenCalledWith(mockUser.email, mockResetToken.token);
    });

    it('should not throw error and log warning if user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(undefined);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}); // Мокируем console.warn

      await service.requestPasswordReset(nonExistentRequestDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(nonExistentRequestDto.email);
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Попытка сброса пароля для несуществующего email: ${nonExistentRequestDto.email}`);
      expect(mockPasswordResetTokensService.createToken).not.toHaveBeenCalled();
      expect(mockPasswordResetTokensService.sendPasswordResetCode).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore(); // Восстанавливаем оригинальный console.warn
    });
  });

  // --- Тесты для confirmPasswordReset ---
  describe('confirmPasswordReset', () => {
    const confirmDto: ConfirmPasswordResetDto = { email: 'test@example.com', code: '123456' };
    const invalidConfirmDto: ConfirmPasswordResetDto = { email: 'test@example.com', code: '999999' };

    it('should return success message if code is valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokensService.findValidToken.mockResolvedValue(mockResetToken);

      const result = await service.confirmPasswordReset(confirmDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(confirmDto.email);
      expect(mockPasswordResetTokensService.findValidToken).toHaveBeenCalledWith(mockUser.userId, confirmDto.code);
      expect(result).toEqual({ message: 'Код подтверждения верен.' });
    });

    it('should throw BadRequestException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(undefined);

      await expect(service.confirmPasswordReset(confirmDto)).rejects.toThrow(
        new BadRequestException('Неверный email или код подтверждения'),
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(confirmDto.email);
      expect(mockPasswordResetTokensService.findValidToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if code is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokensService.findValidToken.mockResolvedValue(null); // Токен не найден/невалиден

      await expect(service.confirmPasswordReset(invalidConfirmDto)).rejects.toThrow(
        new BadRequestException('Неверный email или код подтверждения'),
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(invalidConfirmDto.email);
      expect(mockPasswordResetTokensService.findValidToken).toHaveBeenCalledWith(mockUser.userId, invalidConfirmDto.code);
    });
  });

  // --- Тесты для resetPassword ---
  describe('resetPassword', () => {
    const resetDto: ResetPasswordDto = {
      email: 'test@example.com',
      code: '123456',
      newPassword: 'newStrongPassword123',
      confirmNewPassword: 'newStrongPassword123',
    };
    const resetDtoMismatch: ResetPasswordDto = {
      ...resetDto,
      confirmNewPassword: 'mismatchedPassword',
    };

    it('should reset password successfully', async () => {
      // Мокируем confirmPasswordReset (внутренний вызов)
      jest.spyOn(service, 'confirmPasswordReset').mockResolvedValue({ message: 'Код подтверждения верен.' });
      mockUserService.findByEmail.mockResolvedValue(mockUser); // Пользователь найден для обновления
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_newStrongPassword123'); // Хешируем новый пароль
      mockUserService.create.mockResolvedValue({ ...mockUser, passwordHash: 'hashed_newStrongPassword123' }); // Возвращаем обновленного пользователя
      mockPasswordResetTokensService.findValidToken.mockResolvedValue(mockResetToken); // Токен найден для инвалидации
      mockPasswordResetTokensService.invalidateToken.mockResolvedValue(undefined); // Токен инвалидирован

      const result = await service.resetPassword(resetDto);

      expect(service.confirmPasswordReset).toHaveBeenCalledWith({ email: resetDto.email, code: resetDto.code });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(resetDto.email);
      expect(resetDto.newPassword).toEqual(resetDto.confirmNewPassword); // Проверяем, что пароли совпадают
      expect(bcrypt.hash).toHaveBeenCalledWith(resetDto.newPassword, 10);
      expect(mockUserService.create).toHaveBeenCalledWith({ ...mockUser, passwordHash: 'hashed_newStrongPassword123' });
      expect(mockPasswordResetTokensService.findValidToken).toHaveBeenCalledWith(mockUser.userId, resetDto.code);
      expect(mockPasswordResetTokensService.invalidateToken).toHaveBeenCalledWith(mockResetToken);
      expect(result.passwordHash).toEqual('hashed_newStrongPassword123');
    });

    it('should throw BadRequestException if new password and confirmation do not match', async () => {
      jest.spyOn(service, 'confirmPasswordReset').mockResolvedValue({ message: 'Код подтверждения верен.' });
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.resetPassword(resetDtoMismatch)).rejects.toThrow(
        new BadRequestException('Новый пароль и подтверждение не совпадают'),
      );
      expect(service.confirmPasswordReset).toHaveBeenCalledWith({ email: resetDtoMismatch.email, code: resetDtoMismatch.code });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(resetDtoMismatch.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserService.create).not.toHaveBeenCalled();
      expect(mockPasswordResetTokensService.invalidateToken).not.toHaveBeenCalled();
    });

    it('should re-throw error from confirmPasswordReset', async () => {
      jest.spyOn(service, 'confirmPasswordReset').mockRejectedValue(
        new BadRequestException('Неверный email или код подтверждения'),
      );

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        new BadRequestException('Неверный email или код подтверждения'),
      );
      expect(service.confirmPasswordReset).toHaveBeenCalledWith({ email: resetDto.email, code: resetDto.code });
      expect(mockUserService.findByEmail).not.toHaveBeenCalled(); // Не должен вызываться, если confirmPasswordReset выбросил ошибку
    });

    it('should throw BadRequestException if user not found after confirm (edge case)', async () => {
      jest.spyOn(service, 'confirmPasswordReset').mockResolvedValue({ message: 'Код подтверждения верен.' });
      mockUserService.findByEmail.mockResolvedValue(undefined); // Пользователь не найден после подтверждения

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        new BadRequestException('Пользователь не найден после подтверждения кода'),
      );
      expect(service.confirmPasswordReset).toHaveBeenCalledWith({ email: resetDto.email, code: resetDto.code });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(resetDto.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserService.create).not.toHaveBeenCalled();
      expect(mockPasswordResetTokensService.invalidateToken).not.toHaveBeenCalled();
    });
  });
});
