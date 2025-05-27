import { UserService } from "./user.service";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getUserById(id: number): Promise<import("./entity/user.entity").User>;
    getUserByEmail(login: string): Promise<import("./entity/user.entity").User>;
}
