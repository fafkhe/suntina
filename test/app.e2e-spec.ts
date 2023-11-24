import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from '@nestjs/common';

const myMap = new Map();
myMap.set('givenEmail', 'fatemeh.khorshidvand1@gmail.com');
myMap.set('givenCode', '1111');
myMap.set('givenName', 'fatemeh');

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  // #step_one_auth
  it('return true if user provided correct data', async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-one')
      .send({
        email: myMap.get('givenEmail'),
      });

    const expected = 'we will send verification code to your email.';
    expect(x.body.msg).toBe(expected);
  });

  it("fails when the user does'nt provide correct email !", async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer()).post('/auth/step-one').send({
      email: 'asdfghjkl;',
    });

    const expected = 'your email is incorrect!';
    expect(x.body.message).toBe(expected);
  });

  // auth-step-two

  it("fails if user did'nt provide Code", async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        email: myMap.get('givenEmail'),
        name: myMap.get('givenName'),
        code: null,
      });
    expect(x.body.message[0]).toBe('code must be a string');
  });

  it("fails if user did'nt provide Code", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        email: myMap.get('givenEmail'),
        name: myMap.get('givenName'),
        code: '123456',
      });

    expect(x.body.message).toBe('the provided code doesnt match');
  });

  it('return true if user provided correct data', async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        name: 'fatemeh',
        email: myMap.get('givenEmail'),
        code: '1111',
      });

    const { token } = x.body;

    myMap.set('t1', token);

    expect(token).toBeDefined();
  });
});
