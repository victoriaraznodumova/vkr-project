import { QueueTypeEnum } from '../entity/queue-type.enum';
import { QueueVisibilityEnum } from '../entity/queue-visibility.enum';
export declare class QueueDto {
    queueId: number;
    name: string;
    organizationId: number | null;
    type: QueueTypeEnum;
    visibility: QueueVisibilityEnum;
    city: string;
    address: string;
    openingHours: string;
    serviceName: string;
    intervalMinutes: number;
    concurrentVisitors: number;
    privateLinkToken: string | null;
    createdAt: Date;
    createdByUserId: number;
    constructor(partial: Partial<QueueDto>);
}
