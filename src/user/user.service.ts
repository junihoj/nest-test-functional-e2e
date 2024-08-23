import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './user.interface';
import { catchError, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { writeFileSync, existsSync, mkdirSync} from 'fs';
import {unlink} from 'fs/promises';
import * as mime from 'mime-types';
import * as path from 'path';
import { MailerService } from '@nestjs-modules/mailer';
import { Avatar } from './schemas/avatar.schema';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        private readonly httpService: HttpService, 
        private readonly mailService: MailerService,
        private readonly configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject("USERS_SERVICE") private rabbitClient: ClientProxy
        // @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,

    ) {}
    async createUser(createUserDto:CreateUserDto){
        try{
        // const { data } = await firstValueFrom(
        //     this.httpService.post<CreateUserDto>('https://reqres.in/api/users', createUserDto).pipe(
        //       catchError((error: AxiosError) => {
        //         this.logger.error(error.response.data);
        //         throw 'An error happened!';
        //       }),
        //     ),
        // );
        
            const {avatar, ...rest}  = createUserDto;
            const newUser = new this.userModel(rest);
            await newUser.save();
            const message = `Your account was created Successfully`;

            if(newUser.email){
                this.mailService.sendMail({
                    from: 'Onyeka<Savvy>',
                    to: newUser.email,
                    subject: `Account Created Successfully`,
                    text: message,
                });
            }
            // this.rabbitClient.emit("user:created", savedUser.toJSON())
            return (newUser.toJSON());
        }catch(err){
            // console.log("ERROR WHILE CREATING USER", err);
            this.logger.log("ERROR WHILE CREATING USER", err.stack)
            throw new HttpException('An Error occur while Creating User', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getUser(userId:string){

        try{
        const { data } = await firstValueFrom(
            this.httpService.get<any>(`https://reqres.in/api/users/${userId}`).pipe(
              catchError((error: AxiosError) => {
                throw 'An error happened!';
              }),
            ),
          );
          return data;
        }catch(err){
            this.logger.log(`ERROR WHILE CREATING USER` ,err);
            throw new HttpException('An Error occur while processing your request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserAvatar(userId:string){
        try{
            const userData = await this.getUser(userId);
            if(!userData?.data) throw new HttpException(`No such user with id ${userId}, User with id ${userId} can not be retrieve from reqres.in`, HttpStatus.NOT_FOUND)
            const dbUser = await this.userModel.findOne({id:userId, first_name:userData?.data?.first_name});
            if(!dbUser && userData?.data){
                const {avatar, ...data} = userData.data;
                await this.userModel.create(data);
            }else if(dbUser && dbUser.avatar){
                return "data:image/jpg;base64," + dbUser.avatar;
            }
            
            let fileExtension;
            const response = await lastValueFrom(
                this.httpService.get(userData.data?.avatar, { responseType: 'arraybuffer' })
            );
            fileExtension = path.extname(userData.data.avatar);
            
            if(!fileExtension){
                const contentType = response.headers['content-type'];
                fileExtension = mime.extension(contentType);
            }
            const downloadsFolder = this.configService.get<string>("AVATAR_IMAGE_PATH")
            this.logger.log("DOWNLOAD PATH", downloadsFolder)
            if(!existsSync(downloadsFolder)){
                mkdirSync(downloadsFolder);
            }
            const filePath = `${downloadsFolder}/${userId}${fileExtension}`;
            this.logger.log("FILE PATH", filePath)
            writeFileSync(filePath, response.data);

            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            const update  =await this.userModel.findOneAndUpdate({id:userId}, {avatar:base64Image, avatarPath:filePath},{
                lean: true,
                new: true,
            })
            if(!update){
                throw new NotFoundException('user not found');
            }
            return "data:image/jpg;base64," + base64Image;
        }catch(err){
            this.logger.log("ERROR WHILE CREATING USER", err)
            throw new HttpException('An Error occur while Creating User', HttpStatus.INTERNAL_SERVER_ERROR); 
        }
    }

    // async getUserAvatar2(userId:string){
    //     try{
    //         let fileExtension;
    //         const userData = await this.getUser(userId);
    //         const response = await lastValueFrom(
    //             this.httpService.get(userData.avatar, { responseType: 'arraybuffer' })
    //         );

    //         fileExtension = path.extname(userData.avatar);
    //         if(!fileExtension){
    //             const contentType = response.headers['content-type'];
    //             fileExtension = mime.extension(contentType);
    //         }
    //         const filePath = `downloads/${userId}.${fileExtension}`;
    //         if(!existsSync(filePath)){
    //             mkdirSync(filePath);
    //         }
    //         writeFileSync(filePath, response.data);
    //         const base64Image = Buffer.from(response.data).toString('base64');
    //         const update  =await this.avatarModel.findOneAndUpdate({id:userId}, {avatar:base64Image, avatarPath:filePath},{
    //             lean: true,
    //             new: true,
    //           })
    //         if(!update){
    //            throw new NotFoundException('user not found');
    //         }
    //         return base64Image;
    //     }catch(err){

    //     }
    // }

    async deleteUserAvatar(userId:string){
        try{//get userfrom db;
            const dbUser = await this.userModel.findOne({id:userId})
            if(dbUser) throw new HttpException(`User with id ${userId} Not Found`, HttpStatus.NOT_FOUND)
            const filePath = dbUser.avatarPath;
            //first delete 
            await this.userModel.findOneAndDelete({
                id:userId
            });

            //delete the file from the system
        await  unlink(filePath);
        // this.httpService.patch("")
        }catch(err){
            this.logger.log("ERROR OCCUR WHILE DELETING USER", err);
            throw new HttpException(`An Error Occur while Deleting User`, HttpStatus.INTERNAL_SERVER_ERROR)
        }


    }
}
