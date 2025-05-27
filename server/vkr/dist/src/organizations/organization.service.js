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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./entity/organization.entity");
let OrganizationService = class OrganizationService {
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    async create(createOrganizationDto) {
        const existingOrganization = await this.organizationRepository.findOne({
            where: { name: createOrganizationDto.name },
        });
        if (existingOrganization) {
            throw new common_1.ConflictException(`Organization with name "${createOrganizationDto.name}" already exists.`);
        }
        const organization = this.organizationRepository.create(createOrganizationDto);
        return this.organizationRepository.save(organization);
    }
    async findAll() {
        return this.organizationRepository.find({ relations: ['queues'] });
    }
    async findOne(id) {
        const organization = await this.organizationRepository.findOne({
            where: { organizationId: id },
            relations: ['queues'],
        });
        if (!organization) {
            throw new common_1.NotFoundException(`Organization with ID ${id} not found.`);
        }
        return organization;
    }
    async update(id, updateOrganizationDto) {
        const organization = await this.findOne(id);
        if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
            const existingOrganization = await this.organizationRepository.findOne({
                where: { name: updateOrganizationDto.name },
            });
            if (existingOrganization && existingOrganization.organizationId !== id) {
                throw new common_1.ConflictException(`Organization with name "${updateOrganizationDto.name}" already exists.`);
            }
        }
        Object.assign(organization, updateOrganizationDto);
        return this.organizationRepository.save(organization);
    }
    async remove(id) {
        const organization = await this.findOne(id);
        await this.organizationRepository.remove(organization);
    }
};
OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationService);
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=organization.service.js.map