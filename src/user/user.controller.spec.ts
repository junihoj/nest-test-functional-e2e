import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpService } from '@nestjs/axios'; // Add this import if HttpService is from @nestjs/axios
import { MailerService } from '@nestjs-modules/mailer'; // Example for MailerService
import { ConfigService } from '@nestjs/config'; // Example for ConfigService
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: HttpService,
          useValue: {}, // Mock implementation of HttpService
        },
        {
          provide: MailerService,
          useValue: {}, // Mock implementation of MailerService
        },
        {
          provide: ConfigService,
          useValue: {}, // Mock implementation of ConfigService
        },
        {
          provide: getModelToken(User.name),
          useValue: {}, // Mock UserModel
        },
        {
          provide: 'USERS_SERVICE',
          useValue: {
            emit: jest.fn(), // Mock emit method for RabbitMQ
          },
        },
        // {
        //   provide: getModelToken(Avatar.name),
        //   useValue: {}, // Mock AvatarModel
        // },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  
  // it('should get an array of cats', () => {
  //   const newUserData = {
  //     first_name:"someName",
  //     email:"example@example.com"
  //   }
  //   expect(userController.createUser(newUserData)).resolves.toEqual(newUserData);
  // });
});
