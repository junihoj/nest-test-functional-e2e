import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.interface';

@Controller('api')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Post('users')
    async createUser(@Body() createUserDto:CreateUserDto){
        return this.userService.createUser(createUserDto);
    }

    @Get("user/:userId")
    async getUser(@Param('userId') userId:string ){
        return this.userService.getUser(userId)
    }

    @Get("user/:userId/:avatar")
    async getUserAvatar(@Param() params: any){
        const userId  = params.userId
        const avatar  = params.avatar
        if(!userId ){
            throw new HttpException('User Id is required', HttpStatus.BAD_REQUEST);
        }
        if(!avatar){
            throw new HttpException('you need to provide the avatar and the userId in the url', HttpStatus.BAD_REQUEST);
        }
        return this.userService.getUserAvatar(userId);
    }

    @Delete("user/:userId/avatar")
    async deleteUserAvatar(@Param() params){
        const userId  = params.userId
        if(!userId ){
            throw new HttpException('User Id is required', HttpStatus.BAD_REQUEST);
        }
        return this.userService.deleteUserAvatar(userId)
    }
    
}
