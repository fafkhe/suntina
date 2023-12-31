import * as request from 'supertest';
import { config } from 'dotenv';
import { GetContext, SetContext, app, printContext } from './001auth.e2e-spec';



const randomNumber = Math.floor(Math.random() * 10000000);
const randomNumberQuery = Math.floor(Math.random() * 10);

config();

describe('movieContrller (e2e)', () => {
  it('/ (GET)', () => {
    printContext()
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('forbiden', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer()).post(`/movie/create`).send({
      name: 'mr nobody',
      slug: '1133432',
    });

    expect(x.statusCode).toBe(403);
  });

  it('fails if user wants to create movie without admin token', async () => {
    expect.assertions(1);

    const token = GetContext('user-email');

    const x = await request(app.getHttpServer())
      .post(`/movie/create`)
      .set('auth', `ut ${token}`)
      .send({
        name: 'mr nobody',
        description: 'this is a huge film for who wants to see!',
        slug: '1133432',
      });

    expect(x.statusCode).toBe(403);

  });

  it("fails if admin doesn't provide name", async () => {
    expect.assertions(1);

    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .post(`/movie/create`)
      .set('auth', `ut ${token}`)
      .send({
        slug: '1133432',
        role: 'admin',
      });

    expect(x.body.message[0]).toBe('name must be a string');
  });

  //create movie successfuly

  it('successful if admin give sufficient information ', async () => {
    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .post(`/movie/create`)
      .set('auth', `ut ${token}`)
      .send({
        name: 'openheimer',
        slug: 'tt15398776',
        role: 'admin',
      });

    expect(x.statusCode).toBe(201);

    
  });

  //single-movie

  it('fail if Movie-id is incorrect!!', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/movie/single/${randomNumber}`)
      .send({});

    expect(x.statusCode).toBe(404);
  });

  // AllMovie

  it('getting at list 10 movies!!', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer()).get(`/movie/getall`).send({});

    expect(x.statusCode).toBe(200);
  });

  it('getting movie based on page and limit', async () => {

    const x = await request(app.getHttpServer())
      .get(`/movie/getall?limit=${randomNumberQuery}&page=${randomNumberQuery}`)
      .send({});

    expect(x.statusCode).toBe(200);
  });

  it('getting movie with full text search', async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/movie/getall?name=open`)
      .send({});

    expect(x.body.length).not.toBe(0);
  });

  it("not getting the movie if doesn't exist!!", async () => {
    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/movie/getall?name=mrtr`)
      .send({});

    expect(x.body.length).toBe(0);
  });
});
