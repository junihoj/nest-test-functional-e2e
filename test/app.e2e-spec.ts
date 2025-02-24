import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { database } from './constants';

describe('AppController (e2e)', () => {
  let app: INestApplication;
//   beforeAll(async () => {
//     await mongoose.connect(database);
//     await mongoose.connection.db.dropDatabase();
// });

// afterAll(async () => {
//     await mongoose.disconnect();
// });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(MongooseModule)
    .useFactory({
      factory: (configService: ConfigService) => MongooseModule.forRoot(configService.get<string>('MONGO_URI_DEV')),
      inject: [ConfigService],
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it("get user with id 2", ()=>{
    const returnedData = {
      "data": {
          "id": 2,
          "email": "janet.weaver@reqres.in",
          "first_name": "Janet",
          "last_name": "Weaver",
          "avatar": "https://reqres.in/img/faces/2-image.jpg"
      },
      "support": {
          "url": "https://reqres.in/#support-heading",
          "text": "To keep ReqRes free, contributions towards server costs are appreciated!"
      }
    }
    return request(app.getHttpServer())
      .get('/api/user/2')
      .expect(200)
      .expect(returnedData);
  })

  it("should get userAvatar for user with id 2", ()=>{
    const returnedData = "data:image/jpg;base64,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"
    return request(app.getHttpServer())
      .get('/api/user/2/avatar')
      .expect(200)
      .expect(returnedData);
  })
});
