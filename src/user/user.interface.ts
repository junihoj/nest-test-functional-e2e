import { UserDocument } from "./schemas/user.schema";

export interface CreateUserDto extends Partial<Omit<UserDocument, "_id">> {}
