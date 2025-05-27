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
exports.Organization = void 0;
const queue_entity_1 = require("../../queues/entity/queue.entity");
const typeorm_1 = require("typeorm");
let Organization = class Organization {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'organization_id' }),
    __metadata("design:type", Number)
], Organization.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'character varying' }),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'city', type: 'character varying' }),
    __metadata("design:type", String)
], Organization.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', type: 'character varying' }),
    __metadata("design:type", String)
], Organization.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => queue_entity_1.Queue, (queue) => queue.organization),
    __metadata("design:type", Array)
], Organization.prototype, "queues", void 0);
Organization = __decorate([
    (0, typeorm_1.Entity)('organizations')
], Organization);
exports.Organization = Organization;
//# sourceMappingURL=organization.entity.js.map