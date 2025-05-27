import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entity/user.entity';
declare const LocalStrategy_base: new (...args: unknown[] | [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<User>;
}
export {};
