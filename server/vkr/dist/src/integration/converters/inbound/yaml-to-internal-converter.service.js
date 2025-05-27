"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlToInternalConverterService = void 0;
const yaml = require("js-yaml");
class YamlToInternalConverterService {
    async convert(yamlString) {
        let parsedData;
        try {
            if (typeof yamlString !== 'string' || yamlString.trim().length === 0) {
                throw new Error('Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).');
            }
            parsedData = yaml.load(yamlString);
            if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
                throw new Error('Неверный формат YAML: Ожидается корневой объект.');
            }
        }
        catch (error) {
            console.error(`[YamlToInternalConverter]: Ошибка парсинга YAML: ${error.message}`);
            throw new Error(`Неверный формат YAML: ${error.message}`);
        }
        if (parsedData.queueId === undefined || parsedData.queueId === null) {
            throw new Error('Отсутствует обязательное поле: queueId');
        }
        if (parsedData.userId === undefined || parsedData.userId === null) {
            throw new Error('Отсутствует обязательное поле: userId');
        }
        const internalFormat = {
            queueId: typeof parsedData.queueId === 'string' ? parseInt(parsedData.queueId, 10) : parsedData.queueId,
            userId: typeof parsedData.userId === 'string' ? parseInt(parsedData.userId, 10) : parsedData.userId,
            status: parsedData.status || undefined,
            date: parsedData.date || undefined,
            time: parsedData.time || undefined,
            notificationMinutes: parsedData.notificationMinutes ? (typeof parsedData.notificationMinutes === 'string' ? parseInt(parsedData.notificationMinutes, 10) : parsedData.notificationMinutes) : undefined,
            notificationPosition: parsedData.notificationPosition ? (typeof parsedData.notificationPosition === 'string' ? parseInt(parsedData.notificationPosition, 10) : parsedData.notificationPosition) : undefined,
            comment: parsedData.comment || undefined,
        };
        return internalFormat;
    }
}
exports.YamlToInternalConverterService = YamlToInternalConverterService;
//# sourceMappingURL=yaml-to-internal-converter.service.js.map