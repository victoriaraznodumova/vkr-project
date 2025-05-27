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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
const create_queue_dto_1 = require("./dto/create-queue.dto");
const update_queue_dto_1 = require("./dto/update-queue.dto");
const queue_dto_1 = require("./dto/queue.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let QueueController = class QueueController {
    constructor(queuesService) {
        this.queuesService = queuesService;
    }
    async create(createQueueDto, req) {
        const createdByUserId = req.user.userId;
        const queue = await this.queuesService.create(createQueueDto, createdByUserId);
        return new queue_dto_1.QueueDto(queue);
    }
    async findAll(organizationId) {
        const queues = await this.queuesService.findAll(organizationId);
        return queues.map(queue => new queue_dto_1.QueueDto(queue));
    }
    async findOne(id) {
        const queue = await this.queuesService.findOne(id);
        return new queue_dto_1.QueueDto(queue);
    }
    async findOneByPrivateLinkToken(token) {
        const queue = await this.queuesService.findOneByPrivateLinkToken(token);
        return new queue_dto_1.QueueDto(queue);
    }
    async update(id, updateQueueDto, req) {
        const userId = req.user.userId;
        const queue = await this.queuesService.update(id, updateQueueDto, userId);
        return new queue_dto_1.QueueDto(queue);
    }
    async remove(id, req) {
        const userId = req.user.userId;
        await this.queuesService.remove(id, userId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую очередь' }),
    (0, swagger_1.ApiBody)({ type: create_queue_dto_1.CreateQueueDto, description: 'Данные для создания очереди' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Очередь успешно создана.', type: queue_dto_1.QueueDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные входные данные или отсутствует organizationId для организационной очереди.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Очередь с таким именем уже существует.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_queue_dto_1.CreateQueueDto, Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все очереди' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', type: Number, required: false, description: 'Фильтр по ID организации' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает список всех очередей.', type: [queue_dto_1.QueueDto] }),
    __param(0, (0, common_1.Query)('organizationId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить очередь по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID очереди' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает очередь по указанному ID.', type: queue_dto_1.QueueDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Очередь не найдена.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('private/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить очередь по приватному токену' }),
    (0, swagger_1.ApiParam)({ name: 'token', type: String, description: 'Приватный токен очереди' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает очередь по приватному токену.', type: queue_dto_1.QueueDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Очередь не найдена или токен недействителен.' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "findOneByPrivateLinkToken", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить очередь по ID (только для создателя)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID очереди' }),
    (0, swagger_1.ApiBody)({ type: update_queue_dto_1.UpdateQueueDto, description: 'Данные для обновления очереди' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Очередь успешно обновлена.', type: queue_dto_1.QueueDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные входные данные или попытка изменить organizationId для самоорганизованной очереди.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Недостаточно прав (пользователь не является создателем очереди).' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Очередь не найдена.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Очередь с таким именем уже существует.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_queue_dto_1.UpdateQueueDto, Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить очередь по ID (только для создателя)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID очереди' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Очередь успешно удалена.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неавторизованный доступ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Недостаточно прав (пользователь не является создателем очереди).' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Очередь не найдена.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "remove", null);
QueueController = __decorate([
    (0, swagger_1.ApiTags)('queues'),
    (0, common_1.Controller)('queues'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
exports.QueueController = QueueController;
//# sourceMappingURL=queue.controller.js.map