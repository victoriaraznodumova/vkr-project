export interface InternalFormat {
    queueId: number;
    userId: number;
    date?: string;
    time?: string;
    notificationMinutes?: number;
    notificationPosition?: number;
    [key: string]: any;
}
