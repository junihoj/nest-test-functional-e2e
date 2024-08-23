import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Support, SupportSchema } from './support.schema';

// export type UserDocument = User & Document;
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  email: string;

//   @Prop()
//   name: string;

  @Prop()
  id:string;

  @Prop()
  first_name:string;

  @Prop()
  last_name:string;

  @Prop()
  avatar:string;

//   @Prop({ type: SupportSchema })
//   support:Support;
  @Prop()
  avatarPath:string;
}

export const UserSchema = SchemaFactory.createForClass(User);