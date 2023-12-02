import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from '@nestjs/common';

const myMap = new Map();
myMap.set('givenEmail', 'fatemeh.khorshidvand1@gmail.com');
myMap.set('givenEmail-2', 'ali@gmail.com');
myMap.set('givenCode', '1111');
myMap.set('givenName', 'fatemeh');
myMap.set(
  't2',
  'ut eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InVzZXIiLCJpc01hc3RlciI6ZmFsc2UsImlhdCI6MTcwMDkxMDc1MH0.jxfyQEzOSQlHvByCNFIpJhHGihHEFLIRpHXRzZrnBf0',
);

function generateNumericString(length: number) {
  const res = Array.from({ length }).reduce((acc) => {
    return acc + String(Math.floor(Math.random() * 9));
  }, '');
  return String(res);
}

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

  //auth-admin-step-one

  it("fails when the user does'nt provide correct phoneNumber", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_one')
      .send({
        email: myMap.get('givenEmail') + 'asdfdffd',
      });
    expect(x.body.message).toBe('admin is not exist!!');
  });

  //auth-admin-step-two
  it("fails if admin does'nt provide Code", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_two')
      .send({
        name: myMap.get('givenName'),
        email: myMap.get('givenEmail'),
        code: null,
      });

    expect(x.body.message[0]).toBe('code must be a string');
  });

  it("fails if admin does'nt provide Code", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/admin/step_two')
      .send({
        name: myMap.get('givenName'),
        email: myMap.get('givenEmail'),
        code: null,
      });

    expect(x.body.message[0]).toBe('code must be a string');
  });

  //me

  it('me', async () => {
    expect.assertions(1);

    const token = myMap.get('t1');

    const { body } = await request(app.getHttpServer())
      .get('/auth/me')
      .set('auth', `ut ${token}`)
      .send({});

    expect(body.email).toBe(myMap.get('givenEmail'));
  });

  // editProfile
  it("fails if user does'nt exist!", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer()).post('/auth/edit').send({});

    expect(x.statusCode).toBe(401);
  });

  it('return true if user provided correct data!', async () => {
    const token = myMap.get('t1');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/edit')
      .set('auth', `ut ${token}`)
      .send({
        name: myMap.get('givenName') + 'faf',
      });

    console.log(x, 'x.body is here');

    expect(x.statusCode).toBe(201);
  });

  // create-Admin

  it('fails if the admin is not master!', async () => {
    const token = myMap.get('t1');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post('/auth/createAdmin')
      .set('auth', myMap.get('t2'))
      .send({});

    expect(x.statusCode).toBe(403);
  });

  it('If the master provides the correct information, it will be successful', async () => {
    const token = myMap.get('t1');
    expect.assertions(2);
    const email = `test-${Date.now()}${generateNumericString(4)}@test.com`;
    const x = await request(app.getHttpServer())
      .post('/auth/createAdmin')
      .set('auth', `ut ${token}`)
      .send({
        email,
        role: 'admin',
      });

    expect(x.statusCode).toBe(201);

    const y = await request(app.getHttpServer())
      .post('/auth/createAdmin')
      .set('auth', `ut ${token}`)
      .send({
        email,
        role: 'admin',
      });
    expect(y.statusCode).toBe(400);
  });

  // delete-admin

  it('fails if the admin is not master!', async () => {
    const token = myMap.get('t2');
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/auth/delete/:id`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(403);
  });

  it('fails if admin does not exist!', async () => {
    const token = myMap.get('t1');
    expect.assertions(2);

    const x = await request(app.getHttpServer())
      .get(`/auth/delete/${14}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.message).toBe('there is no admin with this id!!');
    expect(x.statusCode).toBe(400);
  });

  it('fails if requester(admin) does not exist in db', async () => {
    const token = myMap.get('t1');
    expect.assertions(2);

    const x = await request(app.getHttpServer())
      .get(`/auth/delete/${14}`)
      .set('auth', myMap.get('t2'))
      .send({});

    expect(x.body.message).toBe('Forbidden resource');
    expect(x.statusCode).toBe(403);
  });
});

describe('Movie (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  //create-Movie
  it('fails if the user wants to create movie', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer()).post(`/movie/create`).send({
      name: 'mr nobody',
      description: 'this a huge film for who wants to see!',
    });

    console.log(x);
    expect(x.statusCode).toBe(403);
  });

  //createMovie
  it('if the addmin provide the information it will be successful!', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/movie/create`)
      .set('auth', myMap.get('t1'))
      .send({
        name: 'mr nobody',
        description: 'this a huge film for who wants to see!',
      });

    console.log(x);
    expect(x.statusCode).toBe(201);
  });

  //editMovie

  // it('fail if the movie does not exist!', () => {

  // })
});
