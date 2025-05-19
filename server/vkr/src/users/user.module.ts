import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";




@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        TypeOrmModule.forFeature([User]), // !!! В модуле автор мы используем все три сущности, поэтому все три сущности необходимо импортирвоать!
    
  ],
    exports: [UserService, TypeOrmModule],
})

export class UserModule {

}
