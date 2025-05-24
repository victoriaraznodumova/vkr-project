import { OutboundConverter } from '../interfaces/outbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';

/**
 * Адаптер для преобразования InternalMessage во внешнюю JSON-строку.
 */
export class InternalToJsonConverterService implements OutboundConverter {
  /**
   * Преобразует InternalMessage в компактную JSON-строку.
   * @param internalFormat Сообщение во внутреннем формате.
   * @returns JSON-строка, представляющая сообщение.
   */
  convert(internalFormat: InternalFormat): string {
    // console.log('[InternalToJsonConverter]: Преобразование внутреннего формата в JSON.');
    // Используем JSON.stringify без третьего аргумента (space) для получения компактной строки.
    // Undefined поля автоматически исключаются из JSON.
    return JSON.stringify(internalFormat);
  }
}
