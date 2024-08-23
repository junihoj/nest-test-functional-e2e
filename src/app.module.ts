import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';



@Module({
  imports: [
      UserModule, ConfigModule.forRoot({
      isGlobal:true
    }),  
    // MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),

    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
