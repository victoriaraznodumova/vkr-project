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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../users/user.service");
const password_reset_tokens_service_1 = require("./password-reset-tokens.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(userService, jwtService, passwordResetTokensService, configService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordResetTokensService = passwordResetTokensService;
        this.configService = configService;
    }
    async register(registerData) {
        const existingUser = await this.userService.findByEmail(registerData.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Пользователь с таким email уже существует');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(registerData.password, saltRounds);
        const newUser = await this.userService.create(Object.assign(Object.assign({}, registerData), { passwordHash: passwordHash }));
        return newUser;
    }
    async validateUser(email, password) {
        const user = await this.userService.findByEmail(email);
        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (isMatch) {
                const { passwordHash } = user, result = __rest(user, ["passwordHash"]);
                return result;
            }
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.userId };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
    async getAuthenticatedUser(userId) {
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Пользователь не найден');
        }
        return user;
    }
    async requestPasswordReset(requestDto) {
        const { email } = requestDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            console.warn(`Попытка сброса пароля для несуществующего email: ${email}`);
            return;
        }
        const token = await this.passwordResetTokensService.createToken(user);
        await this.passwordResetTokensService.sendPasswordResetCode(user.email, token.token);
    }
    async confirmPasswordReset(confirmDto) {
        const { email, code } = confirmDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Неверный email или код подтверждения');
        }
        const validToken = await this.passwordResetTokensService.findValidToken(user.userId, code);
        if (!validToken) {
            throw new common_1.BadRequestException('Неверный email или код подтверждения');
        }
        return { message: 'Код подтверждения верен.' };
    }
    async resetPassword(resetPasswordData) {
        const { email, code, newPassword, confirmNewPassword } = resetPasswordData;
        await this.confirmPasswordReset({ email, code });
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Пользователь не найден после подтверждения кода');
        }
        if (newPassword !== confirmNewPassword) {
            throw new common_1.BadRequestException('Новый пароль и подтверждение не совпадают');
        }
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        user.passwordHash = newPasswordHash;
        const updatedUser = await this.userService.create(user);
        const usedToken = await this.passwordResetTokensService.findValidToken(user.userId, code);
        if (usedToken) {
            await this.passwordResetTokensService.invalidateToken(usedToken);
        }
        return updatedUser;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        password_reset_tokens_service_1.PasswordResetTokensService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map