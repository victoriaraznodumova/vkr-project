// src/auth/password-reset-tokens.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer'; // Импортируем MailerService
import { ConfigService } from '@nestjs/config'; // Импортируем ConfigService

@Injectable()
export class PasswordResetTokensService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private mailerService: MailerService, // Инжектируем MailerService
    private configService: ConfigService, // Инжектируем ConfigService для получения настроек
  ) {}

  /**
   * Генерирует случайный 4-значный числовой код (строка с ведущими нулями).
   * @returns 4-значный числовой код в виде строки.
   */
  private generateNumericCode(): string {
    const code = Math.floor(Math.random() * 1000000);
    return code.toString().padStart(6, '0');
  }

  /**
   * Создает новый токен/код сброса пароля для пользователя.
   * Инвалидирует все предыдущие активные токены для этого пользователя.
   * @param user Пользователь, для которого создается токен.
   * @returns Promise с созданным токеном.
   */
  async createToken(user: User): Promise<PasswordResetToken> {
    await this.invalidateTokensForUser(user.userId);

    const code = this.generateNumericCode();

    // Определяем срок действия токена (например, 15 минут для кода)
    const expiresInMinutes = 15; // Определяем срок действия в минутах
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const newToken = this.passwordResetTokenRepository.create({
      userId: user.userId,
      token: code,
      expiresAt: expiresAt,
      isValid: true,
    });

    // TODO: Добавить логику проверки уникальности сгенерированного кода, если необходимо.

    return this.passwordResetTokenRepository.save(newToken);
  }

  /**
   * Находит активный токен по его значению и ID пользователя.
   * @param userId ID пользователя.
   * @param token Значение токена/кода (4-значная строка).
   * @returns Promise с найденным токеном или null.
   */
  async findValidToken(userId: number, token: string): Promise<PasswordResetToken | null> {
    const foundToken = await this.passwordResetTokenRepository.findOne({
      where: {
        userId: userId,
        token: token,
        isValid: true,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
    return foundToken;
  }

  /**
   * Инвалидирует конкретный токен (помечает как недействительный).
   * @param token Объект токена для инвалидации.
   * @returns Promise, который завершается после обновления.
   */
  async invalidateToken(token: PasswordResetToken): Promise<void> {
    token.isValid = false;
    await this.passwordResetTokenRepository.save(token);
  }

  /**
   * Инвалидирует все активные токены для конкретного пользователя.
   * @param userId ID пользователя.
   * @returns Promise, который завершается после обновления.
   */
  async invalidateTokensForUser(userId: number): Promise<void> {
    await this.passwordResetTokenRepository.update(
      { userId: userId, isValid: true },
      { isValid: false },
    );
  }

  /**
   * Отправляет код сброса пароля пользователю по email.
   * @param email Адрес электронной почты пользователя.
   * @param code Код сброса (4-значная строка).
   * @returns Promise, который завершается после попытки отправки.
   */
   async sendPasswordResetCode(email: string, code: string): Promise<void> {
       try {
           const expiresInMinutes = 15; // Указываем срок действия кода в письме

           await this.mailerService.sendMail({
               to: email, // Кому отправляем
               subject: 'Сброс пароля для вашего аккаунта', // Тема письма
               template: './password-reset', // Имя файла шаблона (без расширения .hbs)
               context: { // Переменные для шаблона
                   code: code,
                   expiresInMinutes: expiresInMinutes,
                   appName: this.configService.get<string>('APP_NAME') || 'Сервис очередей', // Пример получения имени приложения из конфига
               },
           });
           console.log(`Код сброса (${code}) успешно отправлен на email: ${email}`);
       } catch (error) {
           console.error(`Ошибка при отправке кода сброса на email ${email}:`, error);
           // В реальном приложении здесь можно добавить логирование ошибок или отправку уведомлений
           // Не выбрасывайте ошибку, чтобы не давать информацию о существовании email
       }
   }
}
