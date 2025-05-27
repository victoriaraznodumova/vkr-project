// src/auth/password-reset-tokens.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PasswordResetCode } from './entity/password-reset-code.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer'; // Импортируем MailerService
import { ConfigService } from '@nestjs/config'; // Импортируем ConfigService

@Injectable()
export class PasswordResetCodesService {
  constructor(
    @InjectRepository(PasswordResetCode)
    private passwordResetCodeRepository: Repository<PasswordResetCode>,
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
  async createCode(user: User): Promise<PasswordResetCode> {
    await this.invalidateCodesForUser(user.userId);

    const code = this.generateNumericCode();

    // Определяем срок действия токена (например, 15 минут для кода)
    const expiresInMinutes = 15; // Определяем срок действия в минутах
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const newCode = this.passwordResetCodeRepository.create({
      userId: user.userId,
      code: code,
      expiresAt: expiresAt,
      isValid: true,
    });

    // TODO: Добавить логику проверки уникальности сгенерированного кода, если необходимо.

    return this.passwordResetCodeRepository.save(newCode);
  }

  /**
   * Находит активный токен по его значению и ID пользователя.
   * @param userId ID пользователя.
   * @param code Значение токена/кода (6-значная строка).
   * @returns Promise с найденным токеном или null.
   */
  async findValidCode(userId: number, code: string): Promise<PasswordResetCode | null> {
    const foundCode = await this.passwordResetCodeRepository.findOne({
      where: {
        userId: userId,
        code: code,
        isValid: true,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
    return foundCode;
  }

  /**
   * Инвалидирует конкретный токен (помечает как недействительный).
   * @param code Объект токена для инвалидации.
   * @returns Promise, который завершается после обновления.
   */
  async invalidateCode(code: PasswordResetCode): Promise<void> {
    code.isValid = false;
    await this.passwordResetCodeRepository.save(code);
  }

  /**
   * Инвалидирует все активные токены для конкретного пользователя.
   * @param userId ID пользователя.
   * @returns Promise, который завершается после обновления.
   */
  async invalidateCodesForUser(userId: number): Promise<void> {
    await this.passwordResetCodeRepository.update(
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
