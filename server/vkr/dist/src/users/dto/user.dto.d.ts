export declare class UserDto {
    userId: number;
    email: string;
    passwordHash: string;
    registrationDate: Date;
    constructor(partial: Partial<UserDto>);
}
