import { Repository } from 'typeorm';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class PasswordResetTokensService {
    private passwordResetTokenRepository;
    private mailerService;
    private configService;
    constructor(passwordResetTokenRepository: Repository<PasswordResetToken>, mailerService: MailerService, configService: ConfigService);
    private generateNumericCode;
    createToken(user: User): Promise<PasswordResetToken>;
    findValidToken(userId: number, token: string): Promise<PasswordResetToken | null>;
    invalidateToken(token: PasswordResetToken): Promise<void>;
    invalidateTokensForUser(userId: number): Promise<void>;
    sendPasswordResetCode(email: string, code: string): Promise<void>;
}
