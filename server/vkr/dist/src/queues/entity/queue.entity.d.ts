import { Administrator } from '../../administrators/administrator.entity';
import { Organization } from '../../organizations/entity/organization.entity';
import { Entry } from '../../entries/entity/entry.entity';
import { QueueTypeEnum } from './queue-type.enum';
import { QueueVisibilityEnum } from './queue-visibility.enum';
import { User } from '../../users/entity/user.entity';
export declare class Queue {
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
    administrators: Administrator[];
    entries: Entry[];
    organization: Organization;
    createdBy: User;
}
export { QueueTypeEnum };
