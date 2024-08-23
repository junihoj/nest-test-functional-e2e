import 'dotenv/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from 'src/app.module';


export const database = process.env.MONGO_URI_DEV;

export const imports = [
    MongooseModule.forRoot(database),
    
];