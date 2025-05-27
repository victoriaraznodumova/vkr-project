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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const organization_service_1 = require("./organization.service");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const update_organization_dto_1 = require("./dto/update-organization.dto");
const organization_dto_1 = require("./dto/organization.dto");
const swagger_1 = require("@nestjs/swagger");
let OrganizationController = class OrganizationController {
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async create(createOrganizationDto) {
        const organization = await this.organizationsService.create(createOrganizationDto);
        return new organization_dto_1.OrganizationDto(organization);
    }
    async findAll() {
        const organizations = await this.organizationsService.findAll();
        return organizations.map(org => new organization_dto_1.OrganizationDto(org));
    }
    async findOne(id) {
        const organization = await this.organizationsService.findOne(id);
        return new organization_dto_1.OrganizationDto(organization);
    }
    async update(id, updateOrganizationDto) {
        const organization = await this.organizationsService.update(id, updateOrganizationDto);
        return new organization_dto_1.OrganizationDto(organization);
    }
    async remove(id) {
        await this.organizationsService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую организацию' }),
    (0, swagger_1.ApiBody)({ type: create_organization_dto_1.CreateOrganizationDto, description: 'Данные для создания организации' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Организация успешно создана.', type: organization_dto_1.OrganizationDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные входные данные.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Организация с таким именем уже существует.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить все организации' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает список всех организаций.', type: [organization_dto_1.OrganizationDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить организацию по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID организации' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Возвращает организацию по указанному ID.', type: organization_dto_1.OrganizationDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Организация не найдена.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить организацию по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID организации' }),
    (0, swagger_1.ApiBody)({ type: update_organization_dto_1.UpdateOrganizationDto, description: 'Данные для обновления организации' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Организация успешно обновлена.', type: organization_dto_1.OrganizationDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Организация не найдена.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Организация с таким именем уже существует.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить организацию по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Уникальный ID организации' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Организация успешно удалена.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Организация не найдена.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "remove", null);
OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
exports.OrganizationController = OrganizationController;
//# sourceMappingURL=organization.controller.js.map