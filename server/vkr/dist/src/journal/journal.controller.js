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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalController = void 0;
const common_1 = require("@nestjs/common");
const journal_service_1 = require("./journal.service");
const query_journal_entries_dto_1 = require("./dto/query-journal-entries.dto");
const swagger_1 = require("@nestjs/swagger");
const journal_dto_1 = require("./dto/journal.dto");
let JournalController = class JournalController {
    constructor(journalService) {
        this.journalService = journalService;
    }
    async findAll(queryDto) {
        const journalEntries = await this.journalService.findAll(queryDto);
        return journalEntries.map(entry => new journal_dto_1.JournalDto(entry));
    }
    async findOne(id) {
        const journalEntry = await this.journalService.findOne(id);
        return journalEntry ? new journal_dto_1.JournalDto(journalEntry) : null;
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все записи журнала' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает список записей журнала.', type: [journal_dto_1.JournalDto] }),
    (0, swagger_1.ApiQuery)({ name: 'entryId', required: false, description: 'Фильтр по ID записи очереди' }),
    (0, swagger_1.ApiQuery)({ name: 'initiatedByUserId', required: false, description: 'Фильтр по ID пользователя, инициировавшего событие' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Фильтр по типу действия (например, "joined", "removed")' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_journal_entries_dto_1.QueryJournalEntriesDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить запись журнала по ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает запись журнала по указанному ID.', type: journal_dto_1.JournalDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Запись журнала не найдена.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findOne", null);
JournalController = __decorate([
    (0, swagger_1.ApiTags)('journal'),
    (0, common_1.Controller)('journal'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [journal_service_1.JournalService])
], JournalController);
exports.JournalController = JournalController;
//# sourceMappingURL=journal.controller.js.map