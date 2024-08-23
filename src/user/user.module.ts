import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[
    HttpModule,
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Avatar.name, schema: AvatarSchema }
      ]
    ),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    ClientsModule.registerAsync([
      {
        name:"USERS_SERVICE",
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBIT_MQ_URI')],
            queue: configService.get<string>(`RABBIT_MQ_QUEUE`),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ]
  ,
  controllers: [UserController],
  providers: [UserService, ConfigService]
})
export class UserModule {}
