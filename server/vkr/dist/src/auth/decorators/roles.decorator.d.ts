import { UserRoleEnum } from '../../users/entity/user-role.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRoleEnum[]) => import("@nestjs/common").CustomDecorator<string>;
