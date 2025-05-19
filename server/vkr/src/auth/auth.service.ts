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
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { PasswordResetToken } from './entity/password-reset-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordResetTokensService: PasswordResetTokensService, 
  ) {}

  async register(registerData: RegisterUserDto): Promise<User> {
    const existingUser = await this.userService.findByEmail(registerData.email);
    if (existingUser) {
      throw new UnauthorizedException('Пользователь с таким email уже существует');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerData.password, saltRounds);
    const newUser = await this.userService.create({
      email: registerData.email,
      passwordHash: passwordHash,
      registrationDate: new Date(),
    });
    return newUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    //проверка учетных данных для входа
    //не возвращать здесь хеш пароля
    return user;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { email: user.email, sub: user.userId };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

   async getAuthenticatedUser(userId: number): Promise<User | null> {
       return this.userService.findById(userId);
   }

   async requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<void> {
       const { email } = requestDto;
       const user = await this.userService.findByEmail(email);
       if (!user) {
           console.warn(`Попытка сброса пароля для несуществующего email: ${email}`);
           //  можно добавить логирование 
           return; 
       }
       const token = await this.passwordResetTokensService.createToken(user);
       // Реализация отправки email должна быть в passwordResetTokensService или EmailService 
       await this.passwordResetTokensService.sendPasswordResetCode(user.email, token.token); 
   }

   async confirmPasswordReset(confirmDto: ConfirmPasswordResetDto): Promise<PasswordResetToken> {
       const { email, code } = confirmDto;

       const user = await this.userService.findByEmail(email);
       if (!user) {
           throw new BadRequestException('Неверный email или код подтверждения');
       }
       const validToken = await this.passwordResetTokensService.findValidToken(user.userId, code);

       if (!validToken) {
           throw new BadRequestException('Неверный email или код подтверждения');
       }

       // Если токен найден и валиден, возвращаем его.
       // Этот токен может быть использован на следующем шаге для сброса пароля.
       return validToken;
   }


   async resetPassword(resetPasswordData: ResetPasswordDto): Promise<User> {
       const { email, code, newPassword, confirmNewPassword } = resetPasswordData;
       // Используем метод confirmPasswordReset для проверки email и кода/токена
       const validToken = await this.confirmPasswordReset({ email, code }); // Переиспользуем логику проверки
       // validToken содержит объект токена, включая связанного пользователя
       const user = validToken.user; // Получаем пользователя из найденного токена

       // 2. Проверяем, совпадают ли новый пароль и его подтверждение
       if (newPassword !== confirmNewPassword) {
           throw new BadRequestException('Пароли не совпадают');
       }

       // 3. Хешируем новый пароль
       const saltRounds = 10;
       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

       // 4. Обновляем хеш пароля пользователя
       user.passwordHash = newPasswordHash;
       const updatedUser = await this.userService.create(user); // Используем UserService.create (если он умеет обновлять) или usersRepository.save(user)

       // 5. Инвалидируем использованный токен
       await this.passwordResetTokensService.invalidateToken(validToken);

       return updatedUser;
   }
}