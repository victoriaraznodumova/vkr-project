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
exports.QueueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const queue_type_enum_1 = require("../entity/queue-type.enum");
const queue_visibility_enum_1 = require("../entity/queue-visibility.enum");
class QueueDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уникальный ID очереди', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueueDto.prototype, "queueId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название очереди', example: 'Тестовая Организация: Консультация' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID организации (NULL для самоорганизованных)', example: 1, required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueueDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тип очереди', enum: queue_type_enum_1.QueueTypeEnum, example: queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(queue_type_enum_1.QueueTypeEnum),
    __metadata("design:type", String)
], QueueDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Видимость очереди', enum: queue_visibility_enum_1.QueueVisibilityEnum, example: queue_visibility_enum_1.QueueVisibilityEnum.PUBLIC }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(queue_visibility_enum_1.QueueVisibilityEnum),
    __metadata("design:type", String)
], QueueDto.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Город', example: 'Москва' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Адрес', example: 'ул. Пушкина, 10' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Часы работы', example: 'Пн-Пт 9:00-17:00' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "openingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название услуги', example: 'Консультация' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Интервал записи в минутах', example: 15 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueueDto.prototype, "intervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Количество одновременных обслуживаний', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueueDto.prototype, "concurrentVisitors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Токен приватной ссылки', required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueDto.prototype, "privateLinkToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата создания очереди', example: '2023-10-27T10:00:00.000Z' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], QueueDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID пользователя, создавшего очередь', example: 1 }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueueDto.prototype, "createdByUserId", void 0);
exports.QueueDto = QueueDto;
//# sourceMappingURL=queue.dto.js.map