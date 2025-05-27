"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonToInternalConverterService = void 0;
class JsonToInternalConverterService {
    async convert(jsonString) {
        let parsedData;
        try {
            if (typeof jsonString !== 'string') {
                throw new Error('Входные данные не являются строкой JSON.');
            }
            parsedData = JSON.parse(jsonString);
        }
        catch (error) {
            console.error(`[JsonToInternalConverter]: Ошибка парсинга JSON: ${error.message}`);
            throw new Error(`Неверный формат JSON: ${error.message}`);
        }
        if (parsedData.queueId === undefined || parsedData.queueId === null) {
            throw new Error('Отсутствует обязательное поле: queueId');
        }
        if (parsedData.userId === undefined || parsedData.userId === null) {
            throw new Error('Отсутствует обязательное поле: userId');
        }
        const internalFormat = {
            queueId: parsedData.queueId,
            userId: parsedData.userId,
            status: parsedData.status,
            date: parsedData.date,
            time: parsedData.time,
            notificationMinutes: parsedData.notificationMinutes,
            notificationPosition: parsedData.notificationPosition,
            comment: parsedData.comment,
        };
        return internalFormat;
    }
}
exports.JsonToInternalConverterService = JsonToInternalConverterService;
//# sourceMappingURL=json-to-internal-converter.service.js.map