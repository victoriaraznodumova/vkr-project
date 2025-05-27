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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const queue_entity_1 = require("./entity/queue.entity");
const queue_type_enum_1 = require("./entity/queue-type.enum");
const queue_visibility_enum_1 = require("./entity/queue-visibility.enum");
const organization_service_1 = require("../organizations/organization.service");
const uuid_1 = require("uuid");
const administrator_entity_1 = require("../administrators/administrator.entity");
const user_entity_1 = require("../users/entity/user.entity");
let QueueService = class QueueService {
    constructor(queueRepository, administratorRepository, userRepository, organizationsService) {
        this.queueRepository = queueRepository;
        this.administratorRepository = administratorRepository;
        this.userRepository = userRepository;
        this.organizationsService = organizationsService;
    }
    async generateQueueName(queueData) {
        const { type, organizationId, city, address, serviceName } = queueData;
        let name;
        if (type === queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL) {
            if (!organizationId) {
                throw new common_1.BadRequestException('organizationId is required for organizational queues.');
            }
            const organization = await this.organizationsService.findOne(organizationId);
            if (!organization) {
                throw new common_1.NotFoundException(`Organization with ID ${organizationId} not found.`);
            }
            name = `${organization.name}: ${serviceName}`;
        }
        else {
            name = `${city}, ${address}: ${serviceName}`;
        }
        return name;
    }
    async create(createQueueDto, createdByUserId) {
        if (createQueueDto.name !== undefined && createQueueDto.name !== null) {
            throw new common_1.BadRequestException('Queue name is generated automatically and cannot be provided.');
        }
        const name = await this.generateQueueName(createQueueDto);
        const existingQueue = await this.queueRepository.findOne({
            where: { name },
        });
        if (existingQueue) {
            throw new common_1.ConflictException(`Queue with name "${name}" already exists.`);
        }
        const queue = this.queueRepository.create({
            type: createQueueDto.type,
            visibility: createQueueDto.visibility,
            organizationId: createQueueDto.organizationId,
            city: createQueueDto.city,
            address: createQueueDto.address,
            serviceName: createQueueDto.serviceName,
            name,
            createdByUserId,
            createdAt: new Date(),
            privateLinkToken: createQueueDto.privateLinkToken || (createQueueDto.visibility === queue_visibility_enum_1.QueueVisibilityEnum.PRIVATE ? (0, uuid_1.v4)() : null),
            openingHours: createQueueDto.openingHours,
            intervalMinutes: createQueueDto.intervalMinutes,
            concurrentVisitors: createQueueDto.concurrentVisitors,
        });
        return this.queueRepository.save(queue);
    }
    async findAll(organizationId) {
        const findOptions = {
            relations: ['organization', 'createdBy'],
        };
        if (organizationId) {
            findOptions.where = { organizationId };
        }
        return this.queueRepository.find(findOptions);
    }
    async findOne(id) {
        const queue = await this.queueRepository.findOne({
            where: { queueId: id },
            relations: ['organization', 'createdBy', 'entries', 'administrators'],
        });
        if (!queue) {
            throw new common_1.NotFoundException(`Queue with ID ${id} not found.`);
        }
        return queue;
    }
    async findOneByPrivateLinkToken(token) {
        const queue = await this.queueRepository.findOne({
            where: { privateLinkToken: token, visibility: queue_visibility_enum_1.QueueVisibilityEnum.PRIVATE },
            relations: ['organization', 'createdBy', 'entries', 'administrators'],
        });
        if (!queue) {
            throw new common_1.NotFoundException(`Queue with private link token "${token}" not found or is not private.`);
        }
        return queue;
    }
    async isUserAdminOfQueue(userId, queueId) {
        const adminRecord = await this.administratorRepository.findOne({
            where: {
                user: { userId: userId },
                queue: { queueId: queueId },
            },
        });
        return !!adminRecord;
    }
    async update(id, updateQueueDto, userId) {
        const queue = await this.findOne(id);
        const isAdmin = await this.isUserAdminOfQueue(userId, id);
        if (queue.createdByUserId !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('У вас нет разрешения на обновление этой очереди.');
        }
        if (queue.type === queue_type_enum_1.QueueTypeEnum.SELF_ORGANIZED && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== null) {
            throw new common_1.BadRequestException('Cannot change organizationId for self-organized queues.');
        }
        if (queue.type === queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== queue.organizationId) {
            if (updateQueueDto.organizationId === null) {
                throw new common_1.BadRequestException('Cannot set organizationId to null for organizational queues.');
            }
            const newOrganization = await this.organizationsService.findOne(updateQueueDto.organizationId);
            if (!newOrganization) {
                throw new common_1.NotFoundException(`Organization with ID ${updateQueueDto.organizationId} not found.`);
            }
        }
        if (updateQueueDto.privateLinkToken !== undefined) {
            queue.privateLinkToken = updateQueueDto.privateLinkToken;
        }
        const _a = updateQueueDto, { name } = _a, restUpdateDto = __rest(_a, ["name"]);
        Object.assign(queue, restUpdateDto);
        if (updateQueueDto.city !== undefined || updateQueueDto.address !== undefined || updateQueueDto.serviceName !== undefined || updateQueueDto.organizationId !== undefined) {
            queue.name = await this.generateQueueName(queue);
        }
        const existingQueueWithName = await this.queueRepository.findOne({
            where: { name: queue.name },
        });
        if (existingQueueWithName && existingQueueWithName.queueId !== id) {
            throw new common_1.ConflictException(`Queue with name "${queue.name}" already exists.`);
        }
        return this.queueRepository.save(queue);
    }
    async remove(id, userId) {
        const queue = await this.findOne(id);
        const isAdmin = await this.isUserAdminOfQueue(userId, id);
        if (queue.createdByUserId !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('У вас нет разрешения на удаление этой очереди.');
        }
        await this.queueRepository.remove(queue);
    }
};
QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(queue_entity_1.Queue)),
    __param(1, (0, typeorm_1.InjectRepository)(administrator_entity_1.Administrator)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        organization_service_1.OrganizationService])
], QueueService);
exports.QueueService = QueueService;
//# sourceMappingURL=queue.service.js.map