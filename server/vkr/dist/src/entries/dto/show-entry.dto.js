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
exports.ShowEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const entry_status_enum_1 = require("../entity/entry-status.enum");
const user_dto_1 = require("../../users/dto/user.dto");
const queue_dto_1 = require("../../queues/dto/queue.dto");
const journal_dto_1 = require("../../journal/dto/journal.dto");
class ShowEntryDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уникальный ID записи в очереди', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "entryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID очереди', example: 10 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "queueId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID пользователя', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Текущий статус записи', enum: entry_status_enum_1.EntryStatusEnum, example: entry_status_enum_1.EntryStatusEnum.WAITING }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(entry_status_enum_1.EntryStatusEnum),
    __metadata("design:type", String)
], ShowEntryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Время, когда пользователь встал в очередь', example: '2023-10-27T10:00:00.000Z' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShowEntryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Запланированное время записи для орг. очереди (может быть NULL)', example: '2023-10-27T10:30:00.000Z', required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShowEntryDto.prototype, "entryTimeOrg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Позиция в очереди для самоорг. (FIFO) (может быть NULL)', example: 5, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "entryPositionSelf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уникальный порядковый номер в самоорг. очереди (начиная с 1) (может быть NULL)', example: 15, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "sequentialNumberSelf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Время последнего обновления статуса', example: '2023-10-27T10:15:00.000Z' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShowEntryDto.prototype, "statusUpdatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уведомление за N минут до времени записи (для организации) (может быть NULL)', example: 15, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "notificationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уведомление, когда N человек впереди (для самоорганизации) (может быть NULL)', example: 3, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShowEntryDto.prototype, "notificationPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Фактическое время начала обслуживания (может быть NULL)', example: '2023-10-27Т10:35:00.000Z', required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShowEntryDto.prototype, "actualStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Фактическое время завершения обслуживания (может быть NULL)', example: '2023-10-27Т10:50:00.000Z', required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShowEntryDto.prototype, "actualEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Связанный пользователь', type: () => user_dto_1.UserDto, required: false }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => user_dto_1.UserDto),
    __metadata("design:type", user_dto_1.UserDto)
], ShowEntryDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Связанная очередь', type: () => queue_dto_1.QueueDto, required: false }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => queue_dto_1.QueueDto),
    __metadata("design:type", queue_dto_1.QueueDto)
], ShowEntryDto.prototype, "queue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'История событий записи', type: () => [journal_dto_1.JournalDto], required: false }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => journal_dto_1.JournalDto),
    __metadata("design:type", Array)
], ShowEntryDto.prototype, "logs", void 0);
exports.ShowEntryDto = ShowEntryDto;
//# sourceMappingURL=show-entry.dto.js.map