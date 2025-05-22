// src/adapters/outbound/internal-to-json.adapter.ts

import { OutboundAdapter } from '../interfaces/outbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface';

/**
 * Адаптер для преобразования InternalMessage во внешнюю JSON-строку.
 */
export class InternalToJsonAdapter implements OutboundAdapter {
  /**
   * Преобразует InternalMessage в компактную JSON-строку.
   * @param internalMessage Сообщение во внутреннем формате.
   * @returns JSON-строка, представляющая сообщение.
   */
  adapt(internalMessage: InternalMessage): string {
    console.log('[InternalToJsonAdapter]: Преобразование внутреннего формата в JSON.');
    // Используем JSON.stringify без третьего аргумента (space) для получения компактной строки.
    // Undefined поля автоматически исключаются из JSON.
    return JSON.stringify(internalMessage);
  }
}
