// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get, // Импортируем Get для GET запросов
  HttpCode,
  HttpStatus,
  UseInterceptors, // Импортируем UseInterceptors
  ClassSerializerInterceptor, // Импортируем ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto'; // Используем DTO из папки users
import { LoginUserDto } from '../auth/dto/login-user.dto'; // Используем DTO из папки users
import { UserDto } from '../users/dto/user.dto'; // Импортируем UserDto
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Предполагается, что у вас есть JwtAuthGuard
import { LocalAuthGuard } from './guards/local-auth.guard'; // Предполагается, что у вас есть LocalAuthGuard
import { User } from '../users/entity/user.entity'; // Импортируем сущность User
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'; // Импортируем DTO для сброса пароля
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto'; // Импортируем DTO для подтверждения сброса
import { ResetPasswordDto } from './dto/reset-password.dto'; // Импортируем DTO для установки нового пароля


// Определяем базовый путь для всех эндпоинтов в этом контроллере
@Controller('auth')
// Применяем ClassSerializerInterceptor ко всем эндпоинтам в этом контроллере
// Это гарантирует, что декораторы @Exclude/@Expose в DTO будут работать
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Обрабатывает запрос на регистрацию нового пользователя.
   * POST /auth/register
   * @param registerUserDto DTO с данными для регистрации.
   * @returns Promise с созданным пользователем (DTO).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Статус 201 Created
  async register(@Body() registerUserDto: RegisterUserDto): Promise<UserDto> {
    const user = await this.authService.register(registerUserDto);
    return user as unknown as UserDto;
  }

  /**
   * Обрабатывает запрос на вход пользователя.
   * POST /auth/login
   * Использует LocalAuthGuard для проверки учетных данных.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Promise с JWT токеном.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Статус 200 OK
  @UseGuards(LocalAuthGuard) // Используем LocalAuthGuard
  async login(@Request() req: { user: User }, @Body() loginData: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.login(req.user);
  }

  /**
   * Обрабатывает запрос на получение профиля аутентифицированного пользователя.
   * GET /auth/profile
   * Использует JwtAuthGuard для защиты маршрута.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Promise с данными аутентифицированного пользователя (DTO).
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK) // Статус 200 OK
  @UseGuards(JwtAuthGuard) // Используем JwtAuthGuard
  async getProfile(@Request() req: { user: User }): Promise<UserDto> {
    return req.user as unknown as UserDto;
  }

   /**
    * Обрабатывает запрос на сброс пароля (шаг 1: запрос кода).
    * POST /auth/request-password-reset
    * @param requestPasswordResetDto DTO с email пользователя.
    * @returns Promise с сообщением об успехе.
    */
   @Post('request-password-reset')
   @HttpCode(HttpStatus.OK) // Статус 200 OK
   async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto): Promise<{ message: string }> {
       // !!! ИСПРАВЛЕНО: Вызываем метод сервиса для обработки запроса !!!
       await this.authService.requestPasswordReset(requestPasswordResetDto);

       // Возвращаем общий успешный ответ, чтобы не давать информацию о существовании email
       return { message: 'Код для восстановления пароля отправлен на email.' };
   }

   /**
    * Обрабатывает запрос на подтверждение кода сброса пароля (шаг 2: подтверждение кода).
    * POST /auth/confirm-password-reset
    * @param confirmPasswordResetDto DTO с email и кодом подтверждения.
    * @returns Promise с сообщением об успехе.
    */
   @Post('confirm-password-reset')
   @HttpCode(HttpStatus.OK) // Статус 200 OK
   async confirmPasswordReset(@Body() confirmPasswordResetDto: ConfirmPasswordResetDto): Promise<{ message: string }> {
       // !!! ИСПРАВЛЕНО: Вызываем метод сервиса для обработки подтверждения !!!
       await this.authService.confirmPasswordReset(confirmPasswordResetDto);

       // Возвращаем сообщение об успехе
       return { message: 'Код подтверждения верен. Теперь вы можете установить новый пароль.' };
   }

   /**
    * Обрабатывает запрос на установку нового пароля (шаг 3: установка пароля).
    * POST /auth/reset-password
    * @param resetPasswordDto DTO с email, кодом подтверждения и новым паролем.
    * @returns Promise с обновленным пользователем (DTO).
    */
   @Post('reset-password')
   @HttpCode(HttpStatus.OK) // Статус 200 OK
   async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<UserDto> {
       // !!! ИСПРАВЛЕНО: Вызываем метод сервиса для обработки сброса пароля !!!
       const user = await this.authService.resetPassword(resetPasswordDto);
       return user as unknown as UserDto;
   }

}
