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
exports.CreateQueueDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const queue_type_enum_1 = require("../entity/queue-type.enum");
const queue_visibility_enum_1 = require("../entity/queue-visibility.enum");
class CreateQueueDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID организации (для организационных очередей)', example: 1, required: false, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'ID организации должен быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'ID организации должен быть положительным числом' }),
    __metadata("design:type", Number)
], CreateQueueDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тип очереди', enum: queue_type_enum_1.QueueTypeEnum, example: queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Тип очереди не может быть пустым' }),
    (0, class_validator_1.IsEnum)(queue_type_enum_1.QueueTypeEnum, { message: 'Некорректный тип очереди' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Видимость очереди', enum: queue_visibility_enum_1.QueueVisibilityEnum, example: queue_visibility_enum_1.QueueVisibilityEnum.PUBLIC }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Видимость очереди не может быть пустой' }),
    (0, class_validator_1.IsEnum)(queue_visibility_enum_1.QueueVisibilityEnum, { message: 'Некорректная видимость очереди' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Город, где находится очередь', example: 'Москва' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Город не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Город должен быть строкой' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Адрес очереди', example: 'ул. Пушкина, 10' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Адрес не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Адрес должен быть строкой' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Часы работы (для организационных очередей)', example: 'Пн-Пт 9:00-17:00' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Часы работы не могут быть пустыми' }),
    (0, class_validator_1.IsString)({ message: 'Часы работы должны быть строкой' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "openingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название услуги (для организационных очередей)', example: 'Консультация' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Название услуги не может быть пустым' }),
    (0, class_validator_1.IsString)({ message: 'Название услуги должно быть строкой' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Интервал записи в минутах (для организационных очередей)', example: 15 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Интервал записи не может быть пустым' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Интервал записи должен быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'Интервал записи должен быть положительным числом' }),
    __metadata("design:type", Number)
], CreateQueueDto.prototype, "intervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Количество посетителей, обслуживаемых одновременно', example: 1 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Количество одновременных обслуживаний не может быть пустым' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Количество одновременных обслуживаний должно быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'Количество одновременных обслуживаний должно быть не менее 1' }),
    __metadata("design:type", Number)
], CreateQueueDto.prototype, "concurrentVisitors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Токен приватной ссылки (может быть NULL)', required: false, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Токен приватной ссылки должен быть строкой' }),
    __metadata("design:type", String)
], CreateQueueDto.prototype, "privateLinkToken", void 0);
exports.CreateQueueDto = CreateQueueDto;
//# sourceMappingURL=create-queue.dto.js.map