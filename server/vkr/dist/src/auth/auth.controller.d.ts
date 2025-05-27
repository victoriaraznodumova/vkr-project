import { AuthService } from './auth.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/entity/user.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerUserDto: RegisterUserDto): Promise<UserDto>;
    login(req: {
        user: User;
    }, loginData: LoginUserDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: {
        user: User;
    }): Promise<UserDto>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(confirmPasswordResetDto: ConfirmPasswordResetDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<UserDto>;
}
