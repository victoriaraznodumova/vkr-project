import { User } from '../../users/entity/user.entity';
export declare class PasswordResetCode {
    id: number;
    code: string;
    expiresAt: Date;
    isValid: boolean;
    createdAt: Date;
    userId: number;
    user: User;
}
