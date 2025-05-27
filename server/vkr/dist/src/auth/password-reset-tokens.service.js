"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetTokensService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const password_reset_token_entity_1 = require("./entity/password-reset-token.entity");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let PasswordResetTokensService = class PasswordResetTokensService {
    constructor(passwordResetTokenRepository, mailerService, configService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailerService = mailerService;
        this.configService = configService;
    }
    generateNumericCode() {
        const code = Math.floor(Math.random() * 1000000);
        return code.toString().padStart(6, '0');
    }
    async createToken(user) {
        await this.invalidateTokensForUser(user.userId);
        const code = this.generateNumericCode();
        const expiresInMinutes = 15;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
        const newToken = this.passwordResetTokenRepository.create({
            userId: user.userId,
            token: code,
            expiresAt: expiresAt,
            isValid: true,
        });
        return this.passwordResetTokenRepository.save(newToken);
    }
    async findValidToken(userId, token) {
        const foundToken = await this.passwordResetTokenRepository.findOne({
            where: {
                userId: userId,
                token: token,
                isValid: true,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            relations: ['user'],
        });
        return foundToken;
    }
    async invalidateToken(token) {
        token.isValid = false;
        await this.passwordResetTokenRepository.save(token);
    }
    async invalidateTokensForUser(userId) {
        await this.passwordResetTokenRepository.update({ userId: userId, isValid: true }, { isValid: false });
    }
    async sendPasswordResetCode(email, code) {
        try {
            const expiresInMinutes = 15;
            await this.mailerService.sendMail({
                to: email,
                subject: 'Сброс пароля для вашего аккаунта',
                template: './password-reset',
                context: {
                    code: code,
                    expiresInMinutes: expiresInMinutes,
                    appName: this.configService.get('APP_NAME') || 'Сервис очередей',
                },
            });
            console.log(`Код сброса (${code}) успешно отправлен на email: ${email}`);
        }
        catch (error) {
            console.error(`Ошибка при отправке кода сброса на email ${email}:`, error);
        }
    }
};
PasswordResetTokensService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mailer_1.MailerService,
        config_1.ConfigService])
], PasswordResetTokensService);
exports.PasswordResetTokensService = PasswordResetTokensService;
//# sourceMappingURL=password-reset-tokens.service.js.map