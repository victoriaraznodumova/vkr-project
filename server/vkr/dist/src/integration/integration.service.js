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
exports.FormatProcessingService = void 0;
const common_1 = require("@nestjs/common");
const converter_factory_service_1 = require("./converters/converter-factory.service");
const entry_service_1 = require("../entries/entry.service");
let FormatProcessingService = class FormatProcessingService {
    constructor(converterFactory, entryService) {
        this.converterFactory = converterFactory;
        this.entryService = entryService;
    }
    async processFormat(rawData, contentType, acceptHeaders) {
        console.log(`[FormatProcessingService]: Начало обработки сообщения. Content-Type: ${contentType}, Accept: ${acceptHeaders}`);
        try {
            const inboundConverter = this.converterFactory.getInboundConverter(contentType);
            const internalFormat = await inboundConverter.convert(rawData);
            console.log('[FormatProcessingService]: Данные преобразованы во внутренний формат:', internalFormat);
            const createEntryDto = {
                queueId: internalFormat.queueId,
                date: internalFormat.date,
                time: internalFormat.time,
                notificationMinutes: internalFormat.notificationMinutes,
                notificationPosition: internalFormat.notificationPosition,
            };
            console.log('[FormatProcessingService]: Сформирован CreateEntryDto:', createEntryDto);
            const newEntry = await this.entryService.create(createEntryDto, internalFormat.userId);
            console.log('[FormatProcessingService]: Запись успешно добавлена в очередь. Результат:', newEntry);
            const outboundConverter = this.converterFactory.getOutboundConverter(acceptHeaders);
            const responseData = outboundConverter.convert(newEntry);
            console.log('[FormatProcessingService]: Ответ преобразован в формат клиента.');
            return responseData;
        }
        catch (error) {
            console.error(`[FormatProcessingService]: Ошибка обработки: ${error.message}`);
            throw error;
        }
    }
};
FormatProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [converter_factory_service_1.ConverterFactoryService,
        entry_service_1.EntryService])
], FormatProcessingService);
exports.FormatProcessingService = FormatProcessingService;
//# sourceMappingURL=integration.service.js.map