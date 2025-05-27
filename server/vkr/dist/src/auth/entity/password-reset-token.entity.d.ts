import { User } from '../../users/entity/user.entity';
export declare class PasswordResetToken {
    id: number;
    token: string;
    expiresAt: Date;
    isValid: boolean;
    createdAt: Date;
    userId: number;
    user: User;
}
