import { Controller, Get, Query } from "@nestjs/common";
import { UserService } from "./user.service";






@Controller('/api')
export class UserController{

    constructor(private userService: UserService) {}


    @Get('/find_users_by_id')
    async getUserById(@Query('id') id: number){
        return await this.userService.findOne (id);
    }

    @Get('/find_users_by_email')
    async getUserByEmail(@Query('login') login: string){
        return await this.userService.findByEmail (login);
    }





}