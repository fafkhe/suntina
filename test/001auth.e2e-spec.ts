import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

config();

const context = new Map();

export function SetContext(key: string, value: any) {
  context.set(key, value);
}

SetContext('admin-email', process.env.EMAIL_ADMIN);
SetContext(
  'user-email',
  `test-${Date.now()}${generateNumericString(4)}@test.com`,
);
SetContext('wrong-email', process.env.FALSE_EMAIL);
SetContext('given-name', 'fatemeh');

export function GetContext(key: string): any {
  return context.get(key);
}

function generateNumericString(length: number) {
  const res = Array.from({ length }).reduce((acc) => {
    return acc + String(Math.floor(Math.random() * 9));
  }, '');
  return String(res);
}

export let app: NestExpressApplication;

describe('AppController (e2e)', () => {
  it('sets up our app', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', '/views'));
    app.setViewEngine('ejs');
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Auth (e2e)', () => {
  // #step_one_auth
  it('return true if user provided correct data', async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-one')
      .send({
        email: GetContext('user-email'),
      });

    const expected = 'we will send verification code to your email.';
    expect(x.body.msg).toBe(expected);
  });

  it("fails when the user does'nt provide correct email !", async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-one')
      .send({
        email: GetContext('wrong-email'),
      });

    const expected = 'your email is incorrect!';
    expect(x.body.message).toBe(expected);
  });

  // auth-step-two (fails if user did'nt provide Code)

  it("fails if user did'nt provide Code", async () => {
    expect.assertions(2);
    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        email: GetContext('user-email'),
      });

    expect(x.body.statusCode).toBe(400);
    expect(x.body.message[0]).toBe("code must be a string");
  });

  it('fails if user provide wrong code', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        email: GetContext('user-email'),
        code: '123456',
      });

    expect(x.body.message).toBe('the provided code doesnt match');
  });

  it('return true if user provided correct data', async () => {
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post('/auth/step-two')
      .send({
        name: SetContext('user-name', 'fatemeh'),
        email: GetContext('user-email'),
        code: '1111',
      });

    const { token } = x.body;

    SetContext('token', token);

    expect(token).toBeDefined();
  });

  //auth-admin-step-one

  it('fails when the user wants to login', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_one')
      .send({
        email: GetContext('user-email'),
      });
    expect(x.body.message).toBe('forbiden!!!');
  });

  it('return true if the admin prepare correct email', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_one')
      .send({
        email: GetContext('admin-email'),
      });
    expect(x.text).toBe('we will send the code to your gmail account!');
  });

  //auth-admin-step-two
  it("fails if admin does'nt provide Code", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_one')
      .send({
        email: GetContext('user-email') + 'asdfghjk',
      });

    expect(x.body.message).toBe('admin is not exist!!');
  });

  it("fails if admin does'nt provide Code", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_two')
      .send({
        email: GetContext('user-email'),
        code: null,
      });

    expect(x.body.message[0]).toBe('code must be a string');
  });

  it('return true if all data are correct', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_two')
      .send({
        email: GetContext('admin-email'),
        code: '1111',
      });

    const { token } = x.body;

    SetContext('token1', token);

    expect(token).toBeDefined();
  });

  //me-admin

  it('me', async () => {
    expect.assertions(1);

    const token = GetContext('token1');

    const { body } = await request(app.getHttpServer())
      .get('/auth/me')
      .set('auth', `ut ${token}`)
      .send({});

    expect(body.email).toBe(GetContext('admin-email'));
  });

  //me-user

  it('me', async () => {
    expect.assertions(1);

    const token = GetContext('token');

    const { body } = await request(app.getHttpServer())
      .get('/auth/me')
      .set('auth', `ut ${token}`)
      .send({});

    expect(body.email).toBe(GetContext('user-email'));
  });

  // editProfile
  it("fails if user does'nt exist!", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer()).post('/auth/edit').send({});

    expect(x.statusCode).toBe(401);
  });

  it('return true if user provided correct data!', async () => {
    const token = GetContext('token');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/edit')
      .set('auth', `ut ${token}`)
      .send({
        name: GetContext('given-name') + 'faf',
      });

    expect(x.statusCode).toBe(201);
  });

  // create-Admin

  it('fails if the admin is not master!', async () => {
    const token = GetContext('token');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/createAdmin')
      .set('auth', token)
      .send({});

    expect(x.statusCode).toBe(403);
  });

  it('If the master provides the correct information, it will be successful', async () => {
    const token = GetContext('token1');
    expect.assertions(1);
    const email = `test-${Date.now()}${generateNumericString(4)}@test.com`;
    const x = await request(app.getHttpServer())
      .post('/auth/createAdmin')
      .set('auth', `ut ${token}`)
      .send({
        email,
        role: 'admin',
      });

    expect(x.statusCode).toBe(201);
  });

  // delete-admin

  it('fails if the admin is not master!', async () => {
    const token = GetContext('admin-email');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/auth/delete/:id`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(403);
  });

  it('fails if admin does not exist!', async () => {
    const token = GetContext('wrong-email');
    expect.assertions(2);

    const x = await request(app.getHttpServer())
      .get(`/auth/delete/${14}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.message).toBe('Forbidden resource');
    expect(x.statusCode).toBe(403);
  });
});
