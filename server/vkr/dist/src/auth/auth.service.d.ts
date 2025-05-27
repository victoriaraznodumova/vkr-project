import { User } from '../users/entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly passwordResetTokensService;
    private readonly configService;
    constructor(userService: UserService, jwtService: JwtService, passwordResetTokensService: PasswordResetTokensService, configService: ConfigService);
    register(registerData: RegisterUserDto): Promise<User>;
    validateUser(email: string, password: string): Promise<User | null>;
    login(user: User): Promise<{
        accessToken: string;
    }>;
    getAuthenticatedUser(userId: number): Promise<User>;
    requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<void>;
    confirmPasswordReset(confirmDto: ConfirmPasswordResetDto): Promise<any>;
    resetPassword(resetPasswordData: ResetPasswordDto): Promise<User>;
}
