"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const integration_controller_1 = require("./integration.controller");
const integration_service_1 = require("./integration.service");
const converter_factory_service_1 = require("./converters/converter-factory.service");
const queue_module_1 = require("../queues/queue.module");
const entry_module_1 = require("../entries/entry.module");
let IntegrationModule = class IntegrationModule {
};
IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [queue_module_1.QueueModule, entry_module_1.EntryModule],
        controllers: [integration_controller_1.IntegrationController],
        providers: [
            integration_service_1.FormatProcessingService,
            converter_factory_service_1.ConverterFactoryService,
        ],
    })
], IntegrationModule);
exports.IntegrationModule = IntegrationModule;
//# sourceMappingURL=integration.module.js.map