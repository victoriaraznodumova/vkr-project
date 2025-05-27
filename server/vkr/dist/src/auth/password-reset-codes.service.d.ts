import { Repository } from 'typeorm';
import { PasswordResetCode } from './entity/password-reset-code.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class PasswordResetCodesService {
    private passwordResetCodeRepository;
    private mailerService;
    private configService;
    constructor(passwordResetCodeRepository: Repository<PasswordResetCode>, mailerService: MailerService, configService: ConfigService);
    private generateNumericCode;
    createCode(user: User): Promise<PasswordResetCode>;
    findValidCode(userId: number, code: string): Promise<PasswordResetCode | null>;
    invalidateCode(code: PasswordResetCode): Promise<void>;
    invalidateCodesForUser(userId: number): Promise<void>;
    sendPasswordResetCode(email: string, code: string): Promise<void>;
}
