"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organization_service_1 = require("./organization.service");
const organization_controller_1 = require("./organization.controller");
const organization_entity_1 = require("./entity/organization.entity");
let OrganizationsModule = class OrganizationsModule {
};
OrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([organization_entity_1.Organization]),
        ],
        providers: [organization_service_1.OrganizationService],
        controllers: [organization_controller_1.OrganizationController],
        exports: [organization_service_1.OrganizationService],
    })
], OrganizationsModule);
exports.OrganizationsModule = OrganizationsModule;
//# sourceMappingURL=organization.module.js.map