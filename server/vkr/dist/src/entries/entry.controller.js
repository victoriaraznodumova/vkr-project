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
exports.EntryController = void 0;
const common_1 = require("@nestjs/common");
const entry_service_1 = require("./entry.service");
const create_entry_dto_1 = require("./dto/create-entry.dto");
const update_entry_dto_1 = require("./dto/update-entry.dto");
const show_entry_dto_1 = require("./dto/show-entry.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let EntryController = class EntryController {
    constructor(entriesService) {
        this.entriesService = entriesService;
    }
    async create(createEntryDto, req) {
        const entry = await this.entriesService.create(createEntryDto, req.user.userId);
        return entry;
    }
    async findAll() {
        const entries = await this.entriesService.findAll();
        return entries.map(entry => entry);
    }
    async findOne(entryId) {
        const entry = await this.entriesService.findOne(+entryId);
        return entry;
    }
    async update(entryId, updateEntryDto, req) {
        const entry = await this.entriesService.update(+entryId, updateEntryDto, req.user.userId);
        return entry;
    }
    async updateStatus(entryId, updateStatusDto, req) {
        const entry = await this.entriesService.updateStatus(+entryId, updateStatusDto, req.user.userId);
        return entry;
    }
    async remove(entryId, req) {
        await this.entriesService.remove(+entryId, req.user.userId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую запись в очереди' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Запись успешно создана.', type: show_entry_dto_1.ShowEntryDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные запроса.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Очередь или пользователь не найдены.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entry_dto_1.CreateEntryDto, Object]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все записи в очередях' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список записей.', type: [show_entry_dto_1.ShowEntryDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить запись в очереди по ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Запись найдена.', type: show_entry_dto_1.ShowEntryDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Запись не найдена.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить запись в очереди' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Запись успешно обновлена.', type: show_entry_dto_1.ShowEntryDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные запроса.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Запись не найдена.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_entry_dto_1.UpdateEntryDto, Object]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить статус записи в очереди' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус записи успешно обновлен.', type: show_entry_dto_1.ShowEntryDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные запроса.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Запись не найдена.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить запись из очереди' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Запись успешно удалена.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Запись не найдена.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "remove", null);
EntryController = __decorate([
    (0, swagger_1.ApiTags)('entries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('entries'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [entry_service_1.EntryService])
], EntryController);
exports.EntryController = EntryController;
//# sourceMappingURL=entry.controller.js.map