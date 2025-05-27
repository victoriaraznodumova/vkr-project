"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalToYamlConverterService = void 0;
const common_1 = require("@nestjs/common");
const yaml = require("js-yaml");
let InternalToYamlConverterService = class InternalToYamlConverterService {
    convert(internalFormat) {
        console.log('[InternalToYamlConverter]: Преобразование внутреннего формата в YAML.');
        try {
            const yamlString = yaml.dump(internalFormat, { indent: 2 });
            return yamlString;
        }
        catch (error) {
            console.error(`[InternalToYamlConverter]: Ошибка при сериализации в YAML: ${error.message}`);
            throw new Error(`Не удалось преобразовать во внутренний формат YAML: ${error.message}`);
        }
    }
};
InternalToYamlConverterService = __decorate([
    (0, common_1.Injectable)()
], InternalToYamlConverterService);
exports.InternalToYamlConverterService = InternalToYamlConverterService;
//# sourceMappingURL=internal-to-yaml-converter.service.js.map