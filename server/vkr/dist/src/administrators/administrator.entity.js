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
exports.Administrator = void 0;
const queue_entity_1 = require("../queues/entity/queue.entity");
const user_entity_1 = require("../users/entity/user.entity");
const typeorm_1 = require("typeorm");
let Administrator = class Administrator {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Administrator.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'queue_id' }),
    __metadata("design:type", Number)
], Administrator.prototype, "queueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => queue_entity_1.Queue, (queue) => queue.administrators),
    (0, typeorm_1.JoinColumn)({ name: 'queue_id' }),
    __metadata("design:type", queue_entity_1.Queue)
], Administrator.prototype, "queue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.administrators),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Administrator.prototype, "user", void 0);
Administrator = __decorate([
    (0, typeorm_1.Entity)('administrators')
], Administrator);
exports.Administrator = Administrator;
//# sourceMappingURL=administrator.entity.js.map