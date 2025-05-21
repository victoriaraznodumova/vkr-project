// src/journal/dto/create-journal-entry.dto.ts

import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JournalStatusEnum } from '../entity/journal.status.enum';
import { JournalActionEnum } from '../entity/journal.action.enum';

/**
 * DTO для создания новой записи в журнале.
 */
export class CreateJournalEntryDto {
  @ApiProperty({ description: 'ID записи в очереди, к которой относится действие' })
  @IsNumber()
  @IsNotEmpty()
  entryId: number;

  @ApiProperty({ description: 'Тип действия (например, "joined", "status_changed")', enum: JournalActionEnum })
  @IsEnum(JournalActionEnum)
  @IsNotEmpty()
  action: JournalActionEnum;

  @ApiProperty({
    description: 'Предыдущий статус записи (если применимо)',
    enum: JournalStatusEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(JournalStatusEnum)
  @IsOptional()
  prevStatus?: JournalStatusEnum | null;

  @ApiProperty({
    description: 'Новый статус записи (если применимо)',
    enum: JournalStatusEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(JournalStatusEnum)
  @IsOptional()
  newStatus?: JournalStatusEnum | null;

  @ApiProperty({ description: 'ID пользователя, инициировавшего действие' })
  @IsNumber()
  @IsNotEmpty()
  initiatedByUserId: number;

  @ApiProperty({ description: 'Комментарий к событию (если применимо)', nullable: true, required: false })
  @IsString()
  @IsOptional()
  comment?: string | null;
}
