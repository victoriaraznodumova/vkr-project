import { IsOptional, IsNumberString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JournalActionEnum } from '../entity/journal-action.enum';

/**
 * DTO для фильтрации записей журнала.
 */
export class QueryJournalEntriesDto {
  @ApiProperty({ description: 'Фильтр по ID записи', required: false })
  @IsOptional()
  @IsNumberString()
  entryId?: string;

  @ApiProperty({ description: 'Фильтр по ID пользователя, инициировавшего событие', required: false })
  @IsOptional()
  @IsNumberString()
  initiatedByUserId?: string;

  @ApiProperty({ description: 'Фильтр по типу действия', required: false, enum: JournalActionEnum })
  @IsOptional()
  @IsEnum(JournalActionEnum)
  action?: JournalActionEnum;
}