"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlToInternalConverterService = void 0;
const xml2js_1 = require("xml2js");
class XmlToInternalConverterService {
    async convert(rawData) {
        if (typeof rawData !== 'string' || rawData.trim().length === 0) {
            throw new Error('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
        }
        let result;
        try {
            result = await (0, xml2js_1.parseStringPromise)(rawData, { explicitArray: false, mergeAttrs: true });
            const rootKeys = Object.keys(result);
            if (rootKeys.length !== 1) {
                throw new Error('Неверный формат XML: Ожидается один корневой элемент.');
            }
            const rootElement = rootKeys[0];
            if (!result[rootElement] || typeof result[rootElement] !== 'object' || Array.isArray(result[rootElement])) {
                throw new Error('Неверный формат XML: Корневой элемент пуст или имеет некорректный формат.');
            }
        }
        catch (error) {
            throw new Error(`Неверный формат XML: ${error.message}`);
        }
        const rootElement = Object.keys(result)[0];
        const data = result[rootElement];
        if (data.queueId === undefined || data.queueId === null) {
            throw new Error('Отсутствует обязательное поле: queueId');
        }
        if (data.userId === undefined || data.userId === null) {
            throw new Error('Отсутствует обязательное поле: userId');
        }
        const internalFormat = {
            queueId: parseInt(data.queueId, 10),
            userId: parseInt(data.userId, 10),
            status: data.status || undefined,
            date: data.date || undefined,
            time: data.time || undefined,
            notificationMinutes: data.notificationMinutes ? parseInt(data.notificationMinutes, 10) : undefined,
            notificationPosition: data.notificationPosition ? parseInt(data.notificationPosition, 10) : undefined,
            comment: data.comment || undefined,
        };
        return internalFormat;
    }
}
exports.XmlToInternalConverterService = XmlToInternalConverterService;
//# sourceMappingURL=xml-to-internal-converter.service.js.map