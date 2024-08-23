import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Avatar } from './schemas/avatar.schema';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar: 'avatar.jpg',
  avatarPath: '/path/to/avatar.jpg',
};

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Avatar.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockUser as any);
    const result = await service.createUser(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should get a user by id', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockUser),
    } as any);
    const result = await service.getUser('1');
    expect(result).toEqual(mockUser);
  });

  it('should throw if user is not found', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    await expect(service.getUser('1')).rejects.toThrow();
  });

  it('should delete user avatar', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockUser),
    } as any);
    jest.spyOn(userModel, 'deleteOne').mockResolvedValueOnce({ deletedCount: 1 } as any);
    const result = await service.deleteUserAvatar('1');
    expect(result).toEqual({ success: true });
  });

  it('should throw if user avatar not found', async () => {
    jest.spyOn(userModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    await expect(service.deleteUserAvatar('1')).rejects.toThrow();
  });
});
