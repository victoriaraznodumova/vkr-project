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
exports.QueryJournalEntriesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const journal_action_enum_1 = require("../entity/journal-action.enum");
class QueryJournalEntriesDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Фильтр по ID записи', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], QueryJournalEntriesDto.prototype, "entryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Фильтр по ID пользователя, инициировавшего событие', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], QueryJournalEntriesDto.prototype, "initiatedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Фильтр по типу действия', required: false, enum: journal_action_enum_1.JournalActionEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(journal_action_enum_1.JournalActionEnum),
    __metadata("design:type", String)
], QueryJournalEntriesDto.prototype, "action", void 0);
exports.QueryJournalEntriesDto = QueryJournalEntriesDto;
//# sourceMappingURL=query-journal-entries.dto.js.map