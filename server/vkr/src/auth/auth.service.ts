// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { PasswordResetToken } from './entity/password-reset-token.entity'; // Убедитесь, что импортирована сущность токена
import { PasswordResetTokensService } from './password-reset-tokens.service'; // Убедитесь, что импортирован сервис токенов
import { ConfigService } from '@nestjs/config'; // Убедитесь, что импортирован ConfigService


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordResetTokensService: PasswordResetTokensService, // Инжектируем PasswordResetTokensService
    private readonly configService: ConfigService, // Инжектируем ConfigService
  ) {}

  /**
   * Регистрирует нового пользователя.
   * @param registerData DTO с данными для регистрации.
   * @returns Promise с созданным пользователем.
   * @throws BadRequestException если пользователь с таким email уже существует.
   */
  async register(registerData: RegisterUserDto): Promise<User> {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.userService.findByEmail(registerData.email);
    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль перед сохранением
    const saltRounds = 10; // Рекомендуемое количество раундов для bcrypt
    const passwordHash = await bcrypt.hash(registerData.password, saltRounds);

    // Создаем нового пользователя, используя UserService
    const newUser = await this.userService.create({
      ...registerData,
      passwordHash: passwordHash, // Сохраняем хеш пароля
    });

    // Возвращаем созданного пользователя
    return newUser;
  }


  /**
   * Валидирует учетные данные пользователя для локальной стратегии.
   * @param email Email пользователя.
   * @param password Пароль пользователя.
   * @returns Promise с объектом пользователя, если учетные данные верны, иначе null.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && user.passwordHash) { // Проверяем наличие хеша пароля
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (isMatch) {
        // Возвращаем пользователя без хеша пароля для безопасности
        // В реальном приложении, возможно, стоит использовать DTO здесь
        // или полагаться на ClassSerializerInterceptor в контроллере.
        // Для простоты сейчас просто удаляем поле.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...result } = user;
        return result as User; // Возвращаем объект, приведенный к типу User
      }
    }
    return null; // Учетные данные неверны
  }

  /**
   * Генерирует JWT токен для аутентифицированного пользователя.
   * @param user Объект пользователя.
   * @returns Объект с JWT токеном.
   */
  async login(user: User): Promise<{ accessToken: string }> {
    // Payload для JWT токена. Обычно содержит минимальную необходимую информацию.
    const payload = { email: user.email, sub: user.userId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

   /**
    * Находит пользователя по ID (используется JwtStrategy).
    * @param userId ID пользователя.
    * @returns Promise с объектом пользователя.
    * @throws UnauthorizedException если пользователь не найден.
    */
   async getAuthenticatedUser(userId: number): Promise<User> {
       const user = await this.userService.findById(userId);
       if (!user) {
           throw new UnauthorizedException('Пользователь не найден');
       }
       return user;
   }


   /**
    * Инициирует процесс сброса пароля: создает токен и отправляет его пользователю.
    * @param requestDto DTO с email пользователя.
    * @returns Promise, который завершается после попытки отправки.
    * @throws NotFoundException если пользователь не найден (но мы не выбрасываем ее явно).
    */
   async requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<void> {
       const { email } = requestDto;

       const user = await this.userService.findByEmail(email);
       if (!user) {
           console.warn(`Попытка сброса пароля для несуществующего email: ${email}`);
           // Возвращаем void или общий успешный ответ, чтобы не давать информацию о существовании email
           return;
       }

       // Создаем новый токен сброса пароля для пользователя
       const token = await this.passwordResetTokensService.createToken(user);

       // !!! Вызываем метод отправки кода из PasswordResetTokensService !!!
       await this.passwordResetTokensService.sendPasswordResetCode(user.email, token.token);
   }

   /**
    * Подтверждает код сброса пароля.
    * @param confirmDto DTO с email и кодом подтверждения.
    * @returns Promise с объектом токена, если код верен и активен.
    * @throws BadRequestException если email или код неверны, или токен недействителен/просрочен.
    */
   async confirmPasswordReset(confirmDto: ConfirmPasswordResetDto): Promise<any> { // Возвращаемый тип может быть изменен на PasswordResetToken
       const { email, code } = confirmDto;

       const user = await this.userService.findByEmail(email);
       if (!user) {
           throw new BadRequestException('Неверный email или код подтверждения');
       }

       const validToken = await this.passwordResetTokensService.findValidToken(user.userId, code);

       if (!validToken) {
           throw new BadRequestException('Неверный email или код подтверждения');
       }

       // Если токен найден и валиден, возвращаем его или просто подтверждение
       return { message: 'Код подтверждения верен.' }; // Возвращаем сообщение для простоты
   }


   /**
    * Сбрасывает пароль пользователя после подтверждения кода.
    * @param resetPasswordData DTO с email, кодом подтверждения и новым паролем.
    * @returns Promise с обновленным пользователем.
    * @throws BadRequestException если пользователь не найден, код неверный или пароли не совпадают.
    */
   async resetPassword(resetPasswordData: ResetPasswordDto): Promise<User> {
       const { email, code, newPassword, confirmNewPassword } = resetPasswordData;

       // 1. Находим пользователя и проверяем код подтверждения
       // Используем метод confirmPasswordReset для проверки email и кода/токена
       // Этот метод уже выбросит ошибку, если данные неверны
       await this.confirmPasswordReset({ email, code }); // Просто вызываем для проверки и выброса ошибки при необходимости

       // Если confirmPasswordReset прошел успешно, находим пользователя еще раз по email
       const user = await this.userService.findByEmail(email);
       if (!user) {
           // Этот случай маловероятен после успешного confirmPasswordReset, но для надежности
           throw new BadRequestException('Пользователь не найден после подтверждения кода');
       }


       // 2. Проверяем, совпадают ли новый пароль и его подтверждение
       if (newPassword !== confirmNewPassword) {
           throw new BadRequestException('Новый пароль и подтверждение не совпадают');
       }

       // 3. Хешируем новый пароль
       const saltRounds = 10;
       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

       // 4. Обновляем хеш пароля пользователя
       user.passwordHash = newPasswordHash;
       // Используем метод create, если он умеет обновлять, или usersRepository.save(user)
       const updatedUser = await this.userService.create(user);

       // 5. Инвалидируем использованный токен
       // Находим токен еще раз, чтобы его инвалидировать
       const usedToken = await this.passwordResetTokensService.findValidToken(user.userId, code);
       if (usedToken) {
           await this.passwordResetTokensService.invalidateToken(usedToken);
       }


       return updatedUser; // Возвращаем обновленного пользователя
   }
}
