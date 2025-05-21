export interface InternalMessage {
  queueId: number;
  userId: number;
  date?: string,
  time?: string,
  notificationMinutes?: number;
  notificationPosition?: number;





  // Добавьте сюда любые другие поля из вашего CreateEntryDto,
  // которые должны быть преобразованы из внешних форматов
  [key: string]: any; // Для гибкости, если поля могут быть динамическими
}