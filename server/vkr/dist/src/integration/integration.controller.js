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
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const swagger_1 = require("@nestjs/swagger");
const internal_to_xml_converter_servicer_1 = require("./converters/outbound/internal-to-xml-converter.servicer");
const internal_to_json_converter_service_1 = require("./converters/outbound/internal-to-json-converter.service");
const internal_to_yaml_converter_service_1 = require("./converters/outbound/internal-to-yaml-converter.service");
const create_entry_dto_1 = require("../entries/dto/create-entry.dto");
let IntegrationController = class IntegrationController {
    constructor(messageProcessingFacade) {
        this.messageProcessingFacade = messageProcessingFacade;
    }
    async handleIntegrationRequest(contentType, acceptHeader, res, req) {
        let actualRawData = '';
        const normalizedContentType = contentType ? contentType.toLowerCase() : '';
        if (normalizedContentType.includes('application/xml') || normalizedContentType.includes('text/xml')) {
            if (typeof req.body === 'string' && req.body.trim().length > 0) {
                actualRawData = req.body;
            }
            else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
                actualRawData = req.rawBody.toString('utf8');
            }
        }
        else if (normalizedContentType.includes('application/json')) {
            if (typeof req.body === 'object' && req.body !== null) {
                actualRawData = JSON.stringify(req.body);
            }
            else if (typeof req.body === 'string' && req.body.trim().length > 0) {
                actualRawData = req.body;
            }
            else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
                actualRawData = req.rawBody.toString('utf8');
            }
        }
        else if (normalizedContentType.includes('application/yaml')) {
            if (typeof req.body === 'string' && req.body.trim().length > 0) {
                actualRawData = req.body;
            }
            else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
                actualRawData = req.rawBody.toString('utf8');
            }
            else {
                console.warn('[IntegrationController]: YAML body is empty or not captured correctly for YAML Content-Type.');
            }
        }
        else {
            if (typeof req.body === 'string' && req.body.trim().length > 0) {
                actualRawData = req.body;
                console.log('[IntegrationController]: Using req.body (string) for generic content.');
            }
            else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
                actualRawData = req.rawBody.toString('utf8');
                console.log('[IntegrationController]: Using req.rawBody (Buffer) for generic content.');
            }
            else {
                console.warn('[IntegrationController]: Could not determine raw data from req.body or req.rawBody for generic content.');
            }
        }
        try {
            const responseData = await this.messageProcessingFacade.processFormat(actualRawData, contentType, acceptHeader);
            const outboundConverter = this.messageProcessingFacade['converterFactory'].getOutboundConverter(acceptHeader);
            if (outboundConverter instanceof internal_to_xml_converter_servicer_1.InternalToXmlConverterService) {
                res.setHeader('Content-Type', 'application/xml');
            }
            else if (outboundConverter instanceof internal_to_json_converter_service_1.InternalToJsonConverterService) {
                res.setHeader('Content-Type', 'application/json');
            }
            else if (outboundConverter instanceof internal_to_yaml_converter_service_1.InternalToYamlConverterService) {
                res.setHeader('Content-Type', 'application/yaml');
            }
            return responseData;
        }
        catch (error) {
            res.status(common_1.HttpStatus.BAD_REQUEST);
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message,
                error: 'Bad Request',
            };
        }
    }
};
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiConsumes)('application/json', 'application/xml', 'text/xml', 'application/yaml'),
    (0, swagger_1.ApiProduces)('application/json', 'application/xml', 'application/yaml'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Сообщение успешно обработано.',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Запись успешно создана' },
                        entryId: { type: 'number', example: 7 },
                        queueId: { type: 'number', example: 1 },
                        userId: { type: 'number', example: 2 },
                        status: { type: 'string', example: 'waiting' },
                    },
                },
            },
            'application/xml': {
                schema: {
                    type: 'string',
                    format: 'xml',
                    example: '<response><message>Запись успешно создана</message><entryId>7</entryId><queueId>1</queueId><userId>2</userId><status>waiting</status></response>',
                },
            },
            'application/yaml': {
                schema: {
                    type: 'string',
                    format: 'yaml',
                    example: 'message: Запись успешно создана\nentryId: 7\nqueueId: 1\nuserId: 2\nstatus: waiting',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Некорректный запрос или неподдерживаемый формат.',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number', example: 400 },
                        message: { type: 'string', example: 'Неверный формат JSON: ...' },
                        error: { type: 'string', example: 'Bad Request' },
                    },
                },
            },
            'application/xml': {
                schema: {
                    type: 'string',
                    format: 'xml',
                    example: '<error><statusCode>400</statusCode><message>Неверный формат XML: ...</message><error>Bad Request</error></error>',
                },
            },
            'application/yaml': {
                schema: {
                    type: 'string',
                    format: 'yaml',
                    example: 'statusCode: 400\nmessage: Неверный формат YAML: ...\nerror: Bad Request',
                },
            },
        },
    }),
    (0, swagger_1.ApiBody)({
        description: 'Тело запроса для обработки внешних данных. Может быть в JSON, XML или YAML.',
        schema: {
            oneOf: [
                {
                    title: 'JSON Request Body',
                    $ref: (0, swagger_1.getSchemaPath)(create_entry_dto_1.CreateEntryDto),
                    example: {
                        queueId: 123,
                        userId: 456,
                        someExternalData: 'Пример JSON данных',
                    },
                },
                {
                    title: 'XML Request Body',
                    type: 'string',
                    format: 'xml',
                    example: '<externalRequest><queueId>789</queueId><userId>101</userId><externalField>Значение из XML</externalField></externalRequest>',
                },
                {
                    title: 'YAML Request Body',
                    type: 'string',
                    format: 'yaml',
                    example: 'queueId: 123\nuserId: 456\nsomeExternalData: Пример YAML данных',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Headers)('content-type')),
    __param(1, (0, common_1.Headers)('accept')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "handleIntegrationRequest", null);
IntegrationController = __decorate([
    (0, swagger_1.ApiTags)('integrate'),
    (0, common_1.Controller)('integrate'),
    __metadata("design:paramtypes", [integration_service_1.FormatProcessingService])
], IntegrationController);
exports.IntegrationController = IntegrationController;
//# sourceMappingURL=integration.controller.js.map