export enum JournalStatusEnum {
  WAITING = 'waiting', // Соответствует EntryStatusEnum.WAITING
  SERVING = 'serving', // Соответствует EntryStatusEnum.SERVING
  COMPLETED = 'completed', // Соответствует EntryStatusEnum.COMPLETED
  CANCELED = 'canceled', // Соответствует EntryStatusEnum.CANCELED
  NO_SHOW = 'no_show', // Соответствует EntryStatusEnum.NO_SHOW
  LATE = 'late', // Соответствует EntryStatusEnum.LATE
  REMOVED = 'removed', // Специальный статус для журнала, когда запись удалена
  // Дополнительные статусы могут быть добавлены по мере необходимости
}