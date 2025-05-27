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
exports.CreateJournalEntryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const journal_status_enum_1 = require("../entity/journal-status.enum");
const journal_action_enum_1 = require("../entity/journal-action.enum");
class CreateJournalEntryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID записи в очереди, к которой относится действие' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "entryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тип действия (например, "joined", "status_changed")', enum: journal_action_enum_1.JournalActionEnum }),
    (0, class_validator_1.IsEnum)(journal_action_enum_1.JournalActionEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Предыдущий статус записи (если применимо)',
        enum: journal_status_enum_1.JournalStatusEnum,
        nullable: true,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(journal_status_enum_1.JournalStatusEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "prevStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Новый статус записи (если применимо)',
        enum: journal_status_enum_1.JournalStatusEnum,
        nullable: true,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(journal_status_enum_1.JournalStatusEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "newStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID пользователя, инициировавшего действие' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "initiatedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Комментарий к событию (если применимо)', nullable: true, required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "comment", void 0);
exports.CreateJournalEntryDto = CreateJournalEntryDto;
//# sourceMappingURL=create-journal-entry.dto.js.map