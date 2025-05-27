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
exports.ConverterFactoryService = void 0;
const common_1 = require("@nestjs/common");
const json_to_internal_converter_service_1 = require("./inbound/json-to-internal-converter.service");
const xml_to_internal_converter_service_1 = require("./inbound/xml-to-internal-converter.service");
const yaml_to_internal_converter_service_1 = require("./inbound/yaml-to-internal-converter.service");
const internal_to_json_converter_service_1 = require("./outbound/internal-to-json-converter.service");
const internal_to_xml_converter_servicer_1 = require("./outbound/internal-to-xml-converter.servicer");
const internal_to_yaml_converter_service_1 = require("./outbound/internal-to-yaml-converter.service");
let ConverterFactoryService = class ConverterFactoryService {
    constructor() {
        this.inboundConverters = new Map([
            ['application/json', json_to_internal_converter_service_1.JsonToInternalConverterService],
            ['application/xml', xml_to_internal_converter_service_1.XmlToInternalConverterService],
            ['text/xml', xml_to_internal_converter_service_1.XmlToInternalConverterService],
            ['application/yaml', yaml_to_internal_converter_service_1.YamlToInternalConverterService],
        ]);
        this.outboundConverters = new Map([
            ['application/json', internal_to_json_converter_service_1.InternalToJsonConverterService],
            ['application/xml', internal_to_xml_converter_servicer_1.InternalToXmlConverterService],
            ['text/xml', internal_to_xml_converter_servicer_1.InternalToXmlConverterService],
            ['application/yaml', internal_to_yaml_converter_service_1.InternalToYamlConverterService],
        ]);
    }
    getInboundConverter(contentType) {
        const normalizedContentType = contentType ? contentType.toLowerCase() : '';
        const ConverterClass = this.inboundConverters.get(normalizedContentType);
        if (!ConverterClass) {
            throw new Error(`Неподдерживаемый Content-Type для входящих данных: ${contentType}`);
        }
        return new ConverterClass();
    }
    getOutboundConverter(acceptHeader) {
        if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader.includes('*/*')) {
            return new internal_to_json_converter_service_1.InternalToJsonConverterService();
        }
        const acceptedTypes = acceptHeader.split(',').map(type => type.trim().toLowerCase());
        for (const type of acceptedTypes) {
            const ConverterClass = this.outboundConverters.get(type);
            if (ConverterClass) {
                return new ConverterClass();
            }
        }
        throw new Error(`Неподдерживаемый формат вывода (Accept): ${acceptHeader}`);
    }
};
ConverterFactoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConverterFactoryService);
exports.ConverterFactoryService = ConverterFactoryService;
//# sourceMappingURL=converter-factory.service.js.map