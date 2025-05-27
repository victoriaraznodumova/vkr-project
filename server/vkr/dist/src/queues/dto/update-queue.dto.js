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
exports.UpdateQueueDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateQueueDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название очереди (если разрешено редактировать)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Название очереди должно быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID организации (для организационных очередей)', example: 1, required: false, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'ID организации должен быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'ID организации должен быть положительным числом' }),
    __metadata("design:type", Number)
], UpdateQueueDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Город очереди', example: 'Новый Город', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Город должен быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Адрес очереди', example: 'Новый Адрес', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Адрес должен быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Часы работы', example: 'Пн-Пт 10:00-18:00', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Часы работы должны быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "openingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Название услуги', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Название услуги должно быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Интервал записи в минутах', example: 20, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Интервал записи должен быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'Интервал записи должен быть положительным числом' }),
    __metadata("design:type", Number)
], UpdateQueueDto.prototype, "intervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Количество посетителей, обслуживаемых одновременно', example: 2, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Количество одновременных обслуживаний должно быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'Количество одновременных обслуживаний должно быть не менее 1' }),
    __metadata("design:type", Number)
], UpdateQueueDto.prototype, "concurrentVisitors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Токен приватной ссылки', required: false, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Токен приватной ссылки должен быть строкой' }),
    __metadata("design:type", String)
], UpdateQueueDto.prototype, "privateLinkToken", void 0);
exports.UpdateQueueDto = UpdateQueueDto;
//# sourceMappingURL=update-queue.dto.js.map