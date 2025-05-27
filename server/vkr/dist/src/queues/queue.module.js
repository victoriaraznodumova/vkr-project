"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const queue_service_1 = require("./queue.service");
const queue_controller_1 = require("./queue.controller");
const queue_entity_1 = require("./entity/queue.entity");
const organization_module_1 = require("../organizations/organization.module");
const auth_module_1 = require("../auth/auth.module");
const administrator_entity_1 = require("../administrators/administrator.entity");
const user_entity_1 = require("../users/entity/user.entity");
let QueueModule = class QueueModule {
};
QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([queue_entity_1.Queue, administrator_entity_1.Administrator, user_entity_1.User]),
            organization_module_1.OrganizationsModule,
            auth_module_1.AuthModule,
        ],
        providers: [queue_service_1.QueueService],
        controllers: [queue_controller_1.QueueController],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
exports.QueueModule = QueueModule;
//# sourceMappingURL=queue.module.js.map