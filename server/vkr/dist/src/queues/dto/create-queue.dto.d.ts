import { QueueTypeEnum } from '../entity/queue-type.enum';
import { QueueVisibilityEnum } from '../entity/queue-visibility.enum';
export declare class CreateQueueDto {
    organizationId?: number | null;
    type: QueueTypeEnum;
    visibility: QueueVisibilityEnum;
    city: string;
    address: string;
    openingHours: string;
    serviceName: string;
    intervalMinutes: number;
    concurrentVisitors: number;
    privateLinkToken?: string | null;
}
