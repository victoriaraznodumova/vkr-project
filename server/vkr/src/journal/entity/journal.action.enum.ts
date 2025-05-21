// src/journal/entity/journal.action.enum.ts (предполагаемое местоположение)

export enum JournalActionEnum {
  JOINED = 'joined', // Пользователь присоединился к очереди
  LEFT = 'left', // Пользователь покинул очередь (добровольно)
  REMOVED = 'removed', // Запись удалена (пользователем)
  ADMIN_REMOVED = 'admin_removed', // Запись удалена администратором
  STATUS_CHANGED = 'status_changed', // Общее изменение статуса
  STARTED_SERVING = 'started_serving', // Запись переведена в статус "Обслуживается"
  COMPLETED_SERVICE = 'completed_service', // Запись переведена в статус "Завершено"
  USER_CANCELED = 'user_canceled', // Запись отменена пользователем
  ADMIN_CANCELED = 'admin_canceled', // Запись отменена администратором
  NO_SHOW = 'no_show', // Пользователь не явился
  MARKED_LATE = 'marked_late', // Запись помечена как "Опаздывает"
  ADMIN_ADDED = "admin_added"
  // Дополнительные действия могут быть добавлены по мере необходимости
  // Например:
  // NOTIFICATION_SENT = 'notification_sent', // Уведомление отправлено
  // ENTRY_UPDATED = 'entry_updated', // Запись обновлена (общие данные, не статус)
}
