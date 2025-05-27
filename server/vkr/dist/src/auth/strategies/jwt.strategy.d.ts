import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '../../users/entity/user.entity';
declare const JwtStrategy_base: new (...args: unknown[] | [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    validate(payload: any): Promise<User>;
}
export {};
