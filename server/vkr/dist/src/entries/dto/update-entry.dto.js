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
exports.UpdateEntryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateEntryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уведомление за N минут до времени записи', example: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Количество минут для уведомления должно быть числом' }),
    (0, class_validator_1.Min)(0, { message: 'Количество минут для уведомления не может быть отрицательным' }),
    __metadata("design:type", Number)
], UpdateEntryDto.prototype, "notificationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Уведомление, когда N человек впереди', example: 2, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Количество человек для уведомления должно быть числом' }),
    (0, class_validator_1.Min)(1, { message: 'Количество человек для уведомления должно быть положительным числом' }),
    __metadata("design:type", Number)
], UpdateEntryDto.prototype, "notificationPosition", void 0);
exports.UpdateEntryDto = UpdateEntryDto;
//# sourceMappingURL=update-entry.dto.js.map