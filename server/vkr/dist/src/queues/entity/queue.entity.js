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
exports.QueueTypeEnum = exports.Queue = void 0;
const administrator_entity_1 = require("../../administrators/administrator.entity");
const organization_entity_1 = require("../../organizations/entity/organization.entity");
const entry_entity_1 = require("../../entries/entity/entry.entity");
const typeorm_1 = require("typeorm");
const queue_type_enum_1 = require("./queue-type.enum");
Object.defineProperty(exports, "QueueTypeEnum", { enumerable: true, get: function () { return queue_type_enum_1.QueueTypeEnum; } });
const queue_visibility_enum_1 = require("./queue-visibility.enum");
const user_entity_1 = require("../../users/entity/user.entity");
let Queue = class Queue {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'queue_id' }),
    __metadata("design:type", Number)
], Queue.prototype, "queueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'text' }),
    __metadata("design:type", String)
], Queue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Queue.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: queue_type_enum_1.QueueTypeEnum,
        name: 'type',
    }),
    __metadata("design:type", String)
], Queue.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: queue_visibility_enum_1.QueueVisibilityEnum,
        name: 'visibility',
    }),
    __metadata("design:type", String)
], Queue.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'city', type: 'character varying' }),
    __metadata("design:type", String)
], Queue.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', type: 'text' }),
    __metadata("design:type", String)
], Queue.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_hours', type: 'text' }),
    __metadata("design:type", String)
], Queue.prototype, "openingHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_name', type: 'text' }),
    __metadata("design:type", String)
], Queue.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interval_minutes', type: 'integer' }),
    __metadata("design:type", Number)
], Queue.prototype, "intervalMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'concurrent_visitors', type: 'integer' }),
    __metadata("design:type", Number)
], Queue.prototype, "concurrentVisitors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'private_link_token', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Queue.prototype, "privateLinkToken", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Queue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_user_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Queue.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => administrator_entity_1.Administrator, (administrator) => administrator.queue),
    __metadata("design:type", Array)
], Queue.prototype, "administrators", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => entry_entity_1.Entry, (entry) => entry.queue),
    __metadata("design:type", Array)
], Queue.prototype, "entries", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (organization) => organization.queues),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], Queue.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.queues),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Queue.prototype, "createdBy", void 0);
Queue = __decorate([
    (0, typeorm_1.Entity)('queues')
], Queue);
exports.Queue = Queue;
//# sourceMappingURL=queue.entity.js.map