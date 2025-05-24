import { Injectable } from '@nestjs/common';
import { OutboundConverter } from '../interfaces/outbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
import * as yaml from 'js-yaml'; // Импортируем библиотеку js-yaml

@Injectable()
export class InternalToYamlConverterService implements OutboundConverter {
  convert(internalFormat: InternalFormat): string {
    console.log('[InternalToYamlConverter]: Преобразование внутреннего формата в YAML.');
    
    try {
      // Используем yaml.dump для преобразования JavaScript-объекта в YAML-строку.
      // Можно добавить опции для форматирования, например, indent для отступов.
      const yamlString = yaml.dump(internalFormat, { indent: 2 });
      return yamlString;
    } catch (error) {
      console.error(`[InternalToYamlConverter]: Ошибка при сериализации в YAML: ${error.message}`);
      throw new Error(`Не удалось преобразовать во внутренний формат YAML: ${error.message}`);
    }
  }
}