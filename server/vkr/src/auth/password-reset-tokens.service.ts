import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm'; 
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity'; 
// Импортируем или реализуем сервис отправки email
// import { EmailService } from '../email/email.service'; // Пример импорта сервиса email

@Injectable()
export class PasswordResetTokensService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    // @Inject(EmailService) // Пример инжекции сервиса отправки email
    // private emailService: EmailService,
  ) {}

  private generateNumericCode(): string {
    // Генерируем число от 0 до 9999
    const code = Math.floor(Math.random() * 10000);
    return code.toString().padStart(4, '0');
  }

  async createToken(user: User): Promise<PasswordResetToken> {
    await this.invalidateTokensForUser(user.userId);
    const code = this.generateNumericCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    const newToken = this.passwordResetTokenRepository.create({
      userId: user.userId,
      token: code,
      expiresAt: expiresAt,
      isValid: true, 
    });

    // TODO: Добавить логику проверки уникальности сгенерированного кода,
    // если есть риск коллизии (например, если много запросов на сброс для одного пользователя одновременно).
    // В простейшем случае можно просто сохранить и обработать ошибку уникальности, если она возникнет,
    // и сгенерировать новый код.

    return this.passwordResetTokenRepository.save(newToken);
  }

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

  async invalidateToken(token: PasswordResetToken): Promise<void> {
    token.isValid = false;
    await this.passwordResetTokenRepository.save(token);
  }

  async invalidateTokensForUser(userId: number): Promise<void> {
    await this.passwordResetTokenRepository.update(
      { userId: userId, isValid: true }, 
      { isValid: false }, 
    );
  }

  //доделать
   async sendPasswordResetCode(email: string, code: string): Promise<void> {
       console.log(`Отправка кода сброса (${code}) на email: ${email}`);
       // TODO: Реализовать реальную отправку email с кодом, используя EmailService или аналогичный.
       // Например:
       // await this.emailService.sendMail({
       //   to: email,
       //   subject: 'Код сброса пароля',
       //   text: `Ваш код сброса пароля: ${code}. Код действителен в течение 15 минут.`,
       //   html: `<p>Ваш код сброса пароля: <strong>${code}</strong>.</p><p>Код действителен в течение 15 минут.</p>`,
       // });
   }
}
