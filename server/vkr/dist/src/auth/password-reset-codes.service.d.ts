import { Repository } from 'typeorm';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class PasswordResetCodesService {
    private passwordResetCodeRepository;
    private mailerService;
    private configService;
    constructor(passwordResetCodeRepository: Repository<PasswordResetToken>, mailerService: MailerService, configService: ConfigService);
    private generateNumericCode;
    createCode(user: User): Promise<PasswordResetToken>;
    findValidCode(userId: number, code: string): Promise<PasswordResetToken | null>;
    invalidateCode(code: PasswordResetToken): Promise<void>;
    invalidateCodesForUser(userId: number): Promise<void>;
    sendPasswordResetCode(email: string, code: string): Promise<void>;
}
