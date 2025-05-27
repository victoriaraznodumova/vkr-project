import { Administrator } from '../../administrators/administrator.entity';
import { PasswordResetToken } from '../../auth/entity/password-reset-token.entity';
import { Entry } from '../../entries/entity/entry.entity';
import { Journal } from '../../journal/entity/journal.entity';
import { Queue } from '../../queues/entity/queue.entity';
export declare class User {
    userId: number;
    email: string;
    passwordHash: string;
    registrationDate: Date;
    entries: Entry[];
    administrators: Administrator[];
    queues: Queue[];
    initiatedEvents: Journal[];
    passwordResetTokens: PasswordResetToken[];
}
