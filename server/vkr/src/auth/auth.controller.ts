import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service'; // Импортируем AuthService
import { RegisterUserDto } from './dto/register-user.dto'; // Импортируем DTO регистрации
import { LoginUserDto } from './dto/login-user.dto'; // Импортируем DTO входа
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'; // Импортируем DTO запроса сброса
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto'; // Импортируем DTO подтверждения сброса
import { ResetPasswordDto } from './dto/reset-password.dto'; // Импортируем DTO сброса пароля
import { LocalAuthGuard } from './guards/local-auth.guard'; // Импортируем LocalAuthGuard
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Импортируем JwtAuthGuard
import { User } from '../users/entity/user.entity'; // Импортируем сущность User (для типа возвращаемого значения)
import { UserDto } from '../users/dto/user.dto'; // Импортируем UserDto для форматирования ответа
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common'; // Импортируем интерцепторы

// Определяем базовый путь для всех эндпоинтов в этом контроллере
@Controller('auth')
// Применяем ClassSerializerInterceptor ко всем эндпоинтам контроллера
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Обрабатывает запрос на регистрацию нового пользователя.
   * POST /auth/register
   * @param registerData DTO с данными для регистрации.
   * @returns Promise с созданным пользователем (в формате UserDto благодаря интерцептору).
   */
  @Post('register')
  async register(@Body() registerData: RegisterUserDto): Promise<User> {
    // Вызываем метод register сервиса
    const user = await this.authService.register(registerData);
    // ClassSerializerInterceptor автоматически преобразует сущность User в UserDto
    return user;
  }

  /**
   * Обрабатывает запрос на вход пользователя.
   * POST /auth/login
   * Использует LocalAuthGuard для проверки учетных данных.
   * @param req Объект запроса, содержащий пользователя после успешной локальной аутентификации (в req.user).
   * @param loginData DTO с данными для входа (используется для валидации пайпом).
   * @returns Promise с объектом, содержащим JWT-токен.
   */
  @UseGuards(LocalAuthGuard) // Применяем LocalAuthGuard для проверки email/пароля
  @Post('login')
  async login(@Req() req, @Body() loginData: LoginUserDto): Promise<{ accessToken: string }> {
    // Если LocalAuthGuard успешно прошел, Passport.js добавил объект пользователя (из LocalStrategy.validate) в req.user.
    // Теперь мы можем сгенерировать для него JWT-токен.
    return this.authService.login(req.user);
  }

  /**
   * Пример защищенного эндпоинта, требующего аутентификации по JWT.
   * GET /auth/profile
   * Использует JwtAuthGuard для проверки JWT-токена.
   * @param req Объект запроса, содержащий пользователя после успешной JWT-аутентификации (в req.user).
   * @returns Promise с профилем аутентифицированного пользователя (в формате UserDto благодаря интерцептору).
   */
  @UseGuards(JwtAuthGuard) // Применяем JWT Guard для защиты этого эндпоинта
  @Get('profile')
  async getProfile(@Req() req): Promise<User> {
    // Если JwtAuthGuard успешно прошел, Passport.js добавил объект пользователя (из JwtStrategy.validate) в req.user.
    // В данном случае, JwtStrategy.validate возвращает сущность User.
    // ClassSerializerInterceptor автоматически преобразует сущность User в UserDto.
    return req.user;
  }

   /**
    * Обрабатывает запрос на сброс пароля (шаг 1: запрос кода).
    * POST /auth/request-password-reset
    * @param requestDto DTO с email пользователя.
    * @returns Promise с результатом операции (например, сообщением об успехе).
    */
   @Post('request-password-reset')
   async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto): Promise<any> {
       // !!! ВАЖНО: Реализуйте логику генерации и отправки кода/токена в AuthService !!!
       // Например: await this.authService.sendPasswordResetCode(requestDto.email);
       console.log(`Запрос на сброс пароля для email: ${requestDto.email}. Логика отправки кода не реализована.`);
       // Возвращаем общий успешный ответ, чтобы не давать информацию о существовании email
       return { message: 'Код для восстановления пароля отправлен на email.' };
   }

   /**
    * Обрабатывает запрос на подтверждение кода сброса пароля (шаг 2: подтверждение кода).
    * POST /auth/confirm-password-reset
    * @param confirmDto DTO с email и кодом подтверждения.
    * @returns Promise с результатом операции (например, сообщением об успехе).
    */
   @Post('confirm-password-reset')
   async confirmPasswordReset(@Body() confirmDto: ConfirmPasswordResetDto): Promise<any> {
       // !!! ВАЖНО: Реализуйте логику проверки кода в AuthService !!!
       // Например: const isValid = await this.authService.validatePasswordResetCode(confirmDto.email, confirmDto.code);
       // if (!isValid) { throw new BadRequestException('Неверный email или код'); }
       console.log(`Подтверждение кода сброса для email: ${confirmDto.email}, код: ${confirmDto.code}. Логика проверки не реализована.`);
        // В реальном приложении здесь может быть выдан временный токен для шага сброса пароля
       return { message: 'Код подтверждения верен. Теперь вы можете установить новый пароль.' };
   }

   /**
    * Обрабатывает запрос на установку нового пароля (шаг 3: установка пароля).
    * POST /auth/reset-password
    * @param resetDto DTO с email, кодом подтверждения и новым паролем.
    * @returns Promise с обновленным пользователем (в формате UserDto благодаря интерцептору).
    */
   @Post('reset-password')
   async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<User> {
       // Вызываем метод resetPassword сервиса
       const user = await this.authService.resetPassword(resetDto);
       // ClassSerializerInterceptor автоматически преобразует сущность User в UserDto
       return user;
   }
}
