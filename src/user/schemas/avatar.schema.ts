import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

// export type UserDocument = User & Document;
export type AvatarDocument = HydratedDocument<Avatar>;

@Schema()
export class Avatar {
  @Prop()
  id:string;

  @Prop()
  avatar:string;

  @Prop()
  avatarPath:string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);