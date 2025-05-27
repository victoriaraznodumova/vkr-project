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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ResetPasswordDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Адрес электронной почты пользователя', example: 'user@example.com' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email не может быть пустым' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Некорректный формат email' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Код подтверждения из письма', example: '123456' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Код подтверждения не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Код подтверждения должен быть строкой' }),
    (0, class_validator_1.Length)(6, 6, { message: 'Код подтверждения должен состоять из 6 символов' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Новый пароль пользователя (минимум 8 символов)', example: 'NewSecurePassword456!' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Новый пароль не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Новый пароль должен быть строкой' }),
    (0, class_validator_1.MinLength)(8, { message: 'Новый пароль должен быть не менее 8 символов' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Повтор нового пароля для подтверждения', example: 'NewSecurePassword456!' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Повтор пароля не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Повтор пароля должен быть строкой' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "confirmNewPassword", void 0);
exports.ResetPasswordDto = ResetPasswordDto;
//# sourceMappingURL=reset-password.dto.js.map