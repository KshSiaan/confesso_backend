import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from "./user.service"
import type UserType from 'src/lib/types/user';

export interface CreateUserData 
  extends Pick<UserType, "name" | "address" | "bio" | "dob" | "email" | "gender" | "password"> {
  confirm_password: string;
}



@Controller('user')
export class UserController {
    constructor(private readonly UserService: UserService) {}
    @Get()
    async getUsers():Promise<any>{
        return this.UserService.getUsers();
    }
    @Get(':id')
    getUser(@Param('id') id: string): UserType|undefined {
        return this.UserService.getUser(id);
    }
    @Post()
    createUser(@Body()data:CreateUserData){
        return this.UserService.createUser(data)
    }
}
