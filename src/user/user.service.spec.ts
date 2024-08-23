import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HttpService } from '@nestjs/axios';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Avatar } from './schemas/avatar.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './user.interface';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar: 'avatar.jpg',
  avatarPath: '/path/to/avatar.jpg',
};

// {
//   // new: jest.fn().mockResolvedValue(mockUser),
//   // constructor: jest.fn().mockResolvedValue(mockUser),
//   findOne: jest.fn(),
//   create: jest.fn(),
//   findById: jest.fn(),
//   deleteOne: jest.fn(),
//   save: jest.fn(),
//   exec: jest.fn(),
//   toJSON: jest.fn(),

// },
const createMockUserInstance = () => ({
  save: jest.fn(),
  toJSON: jest.fn(),
});
const mockUserModel = {
  new: jest.fn().mockResolvedValue({}),
  constructor: jest.fn().mockResolvedValue({}),
  save: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete:jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof mockUserModel;
  let httpService:HttpService;
  let configService:ConfigService;
  let rabbitClient:ClientProxy;
  let mailerService:MailerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [
      //   ClientsModule.register([
      //     {
      //       name: 'USERS_SERVICE',
      //       transport: Transport.RMQ,
      //       options: {
      //         urls: ['amqp://localhost:5672'],
      //         queue: 'TEST_USER',
      //       },
      //     },
      //   ]),
      // ],
      providers: [
        UserService,
        
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          }, // Mock HttpService
        },
        {
          provide: 'USERS_SERVICE',
          useValue: {
            emit: jest.fn(), // Mock emit method for RabbitMQ
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          }, // Mock MailerService
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          }, // Mock ConfigService
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Avatar.name),
          useValue: {}, // Mock AvatarModel
        },
        
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    // userModel = module.get< typeof mockUserModel>(getModelToken(User.name));
    userModel = module.get<typeof mockUserModel>(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    rabbitClient = module.get<ClientProxy>('USERS_SERVICE');
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userModel).toBeDefined();
    expect(httpService).toBeDefined();
    expect(configService).toBeDefined();
  });


  

  // it('should create a new user, send email, and emit a message', async () => {
  //   const createUserDto: CreateUserDto = {
  //     email: 'test@example.com',
  //     first_name: 'John',
  //     last_name: 'Doe',
  //     avatar: 'test-avatar-url',
  //   };
  //   const mockUserInstance = createMockUserInstance();
  //   const mockUser = {
  //     _id: '123',
  //     ...createUserDto,
  //     save: jest.fn().mockResolvedValue(mockUserInstance),
  //     toJSON: jest.fn().mockReturnValue({ _id: '123', ...createUserDto }),
  //   };

  //   jest.spyOn(userModel, "constructor").mockResolvedValue(mockUser);
  //   jest.spyOn(userModel, "new").mockReturnValue(mockUser);
    
  //   jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});
  //   // jest.spyOn(rabbitClient, 'emit').mockResolvedValue({});

  //   await expect(service.createUser(createUserDto)).resolves.toEqual({
  //     _id: '123',
  //     ...createUserDto,
  //   });
      
  // });

  
  // it('should create a user successfully', async () => {
  //   const createUserDto: CreateUserDto = {
  //     email: 'john.doe@example.com',
  //     // avatar: 'avatar.png',
  //   };



  //   const savedUser = {
  //     ...createUserDto,
  //     save: jest.fn().mockResolvedValue(true),
  //     toJSON: jest.fn().mockReturnValue(createUserDto),
  //   };

  //   // Mock the behavior of the model instance
  //   (userModel as any).mockImplementation(() => savedUser);

  //   // jest.spyOn(userModel.prototype, 'save').mockResolvedValue(savedUser as any);
  //   // jest.spyOn(userModel.prototype, 'toJSON').mockReturnValue(createUserDto);

  //   const result = await service.createUser(createUserDto);
  //   expect(result).toEqual(createUserDto);
  //   expect(userModel.prototype.save).toHaveBeenCalled();
  // })



  // it('should not send email or emit event if user email is not provided', async () => {
  //   // Arrange
  //   const createUserDto: CreateUserDto = {
  //     first_name:"test name",
  //     avatar: 'avatar-url',
  //   };
  //   const savedUser = {
  //     _id: 'some-id',
  //     ...createUserDto,
  //   };

  //   jest.spyOn(userModel, 'save').mockResolvedValueOnce(savedUser as any);

  //   // Act
  //   const result = await service.createUser(createUserDto);

  //   // Assert
  //   expect(mailerService.sendMail).not.toHaveBeenCalled();
  //   expect(rabbitClient.emit).toHaveBeenCalledWith('user:created', savedUser);
  //   expect(result).toEqual(savedUser);
  // });

  


  it('should get a user by id', async () => {
    const userId = "2";
    const userData = {
      data: {
        "id": "2",
        "email": "janet.weaver@reqres.in",
        "first_name": "Janet",
        "last_name": "Weaver",
        "avatar": "https://reqres.in/img/faces/2-image.jpg"
      }
    }
    const response: AxiosResponse<any> = {
      data:userData,
      headers: { 'Content-Type': 'application/json' },
      status: 200,
      statusText: 'OK',
      config: undefined,
    };
    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
      data: userData,
      headers: {'Content-Type': 'application/json'},
      config: undefined,
      status: 200,
      statusText: 'OK',
      })
    );
    const result = await service.getUser(userId);
    expect(result).toEqual(response.data);
    expect(httpService.get).toHaveBeenCalledWith(`https://reqres.in/api/users/${userId}`);
  });

  it('should get user avatar successfully', async () => {
    const userId = '2';
    const userData = { 
      data: {
        id: 2,
        email: "janet.weaver@reqres.in",
        first_name: "Janet",
        last_name: "Weaver",
        avatar: "https://reqres.in/img/faces/2-image.jpg"
      } 
    };
    const dbUser = { 
      id: 1,
      email: "janet.weaver@reqres.in",
      first_name: "Janet",
      last_name: "Weaver",
      // avatar: "https://reqres.in/img/faces/2-image.jpg",
      avatar: 'base64Image' 
    };
    // const response = { data: Buffer.from('image data'), headers: { 'content-type': 'image/png' } };
    const response:AxiosResponse<any> = {
      data: Buffer.from('image data'),
      headers: { 'content-type': 'image/jpg' },
      config: undefined,
      status: 200,
      statusText: 'OK',
    }
    const downloadsFolder = 'test_downloads';

    jest.spyOn(service, 'getUser').mockResolvedValue(userData);
    jest.spyOn(userModel, 'findOne').mockResolvedValue(dbUser);
    jest.spyOn(httpService, 'get').mockReturnValue(of(response));
    jest.spyOn(configService, 'get').mockReturnValue(downloadsFolder);
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'mkdirSync').mockImplementation();
    jest.spyOn(fs, 'writeFileSync').mockImplementation();
    
    const result = await service.getUserAvatar(userId);
    expect(result).toEqual("data:image/jpg;base64," + dbUser.avatar);
  });

  it('should get user avatar successfully given User already in the database', async () => {
    const userId = '2';
    const userData = { 
      data: {
        id: 2,
        email: "janet.weaver@reqres.in",
        first_name: "Janet",
        last_name: "Weaver",
        avatar: "https://reqres.in/img/faces/2-image.jpg"
      } 
    };
    const dbUser = { 
      id: 2,
        email: "janet.weaver@reqres.in",
        first_name: "Janet",
        last_name: "Weaver",
        // avatar: "https://reqres.in/img/faces/2-image.jpg",
        avatar: 'base64Image' 
    };
    const response:AxiosResponse<any> = {
      data:Buffer.from('image data'),
      headers: { 'content-type': 'image/jpg' },
      config: undefined,
      status: 200,
      statusText: 'OK',
    }

    jest.spyOn(service, 'getUser').mockResolvedValue(userData);
    jest.spyOn(userModel, 'findOne').mockResolvedValue(dbUser);

    const result = await service.getUserAvatar(userId);
    expect(result).toEqual("data:image/jpg;base64," + dbUser.avatar);
  });


  it('should handle errors during avatar retrieval', async () => {
    const userId = '1';
    const error = new Error('An error occurred');

    jest.spyOn(service, 'getUser').mockRejectedValue(error);
    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await expect(service.getUserAvatar(userId)).rejects.toThrow(HttpException);
    expect(loggerSpy).toHaveBeenCalledWith('ERROR WHILE CREATING USER', error);
  });


  it('should throw an HttpException if an error occurs while creating a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      avatar: 'test-avatar-url',
    };
    (userModel.save as jest.Mock).mockRejectedValue(new Error('Database Error'));

    await expect(service.createUser(createUserDto)).rejects.toThrow(
      new HttpException('An Error occur while Creating User', HttpStatus.INTERNAL_SERVER_ERROR),
    );

    // expect(userModel.save).toHaveBeenCalled();
    // expect(mailerService.sendMail).not.toHaveBeenCalled();
    // expect(rabbitClient.emit).not.toHaveBeenCalled();
  });

  it("should delete avatar given user Id", async ()=>{
    const userId = 2;
    jest.spyOn(userModel, "findOneAndDelete").mockResolvedValue({});
    jest.spyOn(userModel, "findOne").mockResolvedValue
  })

  it("should throw not found error when trying to delete user not in db", async ()=>{
    const userId = "2";
    jest.spyOn(userModel, "findOne").mockResolvedValue(null);
    await expect(service.deleteUserAvatar(userId)).rejects.toThrow(HttpException);
    expect(userModel.findOne).toHaveBeenCalled();
  })
  
});




// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './user.service';

// describe('UserService', () => {
//   let service: UserService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UserService],
//     }).compile();

//     service = module.get<UserService>(UserService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
