import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupportDocument = Support & Document;

@Schema()
export class Support {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  text: string;
}

export const SupportSchema = SchemaFactory.createForClass(Support);