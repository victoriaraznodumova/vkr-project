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
exports.JournalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const journal_status_enum_1 = require("../entity/journal-status.enum");
const journal_action_enum_1 = require("../entity/journal-action.enum");
const user_dto_1 = require("../../users/dto/user.dto");
class JournalDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уникальный ID записи в журнале', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalDto.prototype, "logId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID записи в очереди, к которой относится событие', example: 10 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalDto.prototype, "entryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тип события (действие)', enum: journal_action_enum_1.JournalActionEnum, example: journal_action_enum_1.JournalActionEnum.ADMIN_ADDED }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(journal_action_enum_1.JournalActionEnum),
    __metadata("design:type", String)
], JournalDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Предыдущий статус записи (если применимо)', enum: journal_status_enum_1.JournalStatusEnum, example: journal_status_enum_1.JournalStatusEnum.WAITING, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(journal_status_enum_1.JournalStatusEnum),
    __metadata("design:type", String)
], JournalDto.prototype, "prevStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Новый статус записи (если применимо)', enum: journal_status_enum_1.JournalStatusEnum, example: journal_status_enum_1.JournalStatusEnum.SERVING, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(journal_status_enum_1.JournalStatusEnum),
    __metadata("design:type", String)
], JournalDto.prototype, "newStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Время, когда произошло событие', example: '2023-10-27T10:05:00.000Z' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], JournalDto.prototype, "logTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID пользователя, инициировавшего событие', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalDto.prototype, "initiatedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Комментарий к событию (если применимо)', example: 'Изменен администратором', required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Пользователь, инициировавший событие', type: () => user_dto_1.UserDto, required: false }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => user_dto_1.UserDto),
    __metadata("design:type", user_dto_1.UserDto)
], JournalDto.prototype, "user", void 0);
exports.JournalDto = JournalDto;
//# sourceMappingURL=journal.dto.js.map