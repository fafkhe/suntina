import * as request from 'supertest';
import { GetContext, SetContext } from './001auth.e2e-spec';
import { app } from './001auth.e2e-spec';
import { generateNumericString } from './003saloon.e2e-spec';

const randomNumber = Math.floor(Math.random() * 100000000);
const randomNumberQuery = Math.floor(Math.random() * 10);

let startDate = new Date(
  new Date().getTime() + 24 * 60 * 60 * 1000,
).toISOString();

let endtDate = new Date(
  new Date().getTime() + 24 * 60 * 60 * 1000,
).toISOString();

describe('saloonController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('successfuly create saloon if information is correct', async () => {
    const token = GetContext('token1');
    expect.assertions(1);
    const x = await request(app.getHttpServer())
      .post(`/saloon/create`)
      .set('auth', `ut ${token}`)
      .send({
        name: generateNumericString(4),
        numOfSeat: 150,
        numOfseatPerRow: 50,
      });

    expect(x.statusCode).toBe(201);

    SetContext('saloonId', x.body.id);
  });
});

describe('movieController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  }, 30000);

  it('successful if admin give sufficient information ', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/movie/create`)
      .set('auth', `ut ${token}`)
      .send({
        name: 'openheimer',
        slug: 'tt15398776',
      });

    SetContext('movieId', x.body.id);
    SetContext('movieName', x.body.name);

    expect(x.statusCode).toBe(201);
  });
});

describe('sansController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('successfuly create sans if information is correct', async () => {
    jest.setTimeout(30000);
    const token = GetContext('token1');
    expect.assertions(1);

    const saloonId = await GetContext('saloonId');
    const movieId = await GetContext('movieId');

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: movieId,
        saloon_id: saloonId,
        start_t: startDate,
        end_t: endtDate,
      });

    SetContext('sansId', x.body[0].id);

    expect(x.statusCode).toBe(201);
  });

  it('fails if admin doese not provide saloon_id & movie_id', async () => {
    const token = GetContext('token1');

    expect.assertions(2);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        start_t: '2023-12-29T08:00:00.492Z',
        end_t: '2023-12-29T11:00:00.492Z',
      });

    expect(x.body.message[0]).toBe(
      'movie_id must be a number conforming to the specified constraints',
    );
    expect(x.body.message[1]).toBe(
      'saloon_id must be a number conforming to the specified constraints',
    );
  });

  it('fails if admin does not provide start_t & end_t ', async () => {
    const token = GetContext('token1');

    expect.assertions(2);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: 3,
        saloon_id: 1,
      });

    expect(x.body.message[0]).toBe('start_t must be a string');
    expect(x.body.message[1]).toBe('end_t must be a string');
  });

  it('fails if movie does not exist in db!', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: randomNumber,
        saloon_id: 3,
        start_t: '2023-12-28T08:00:00.492Z',
        end_t: '2023-12-28T11:00:00.492Z',
      });

    expect(x.body.message).toBe('please make sure that data is correct!!');
  });

  it('fails if saloon does not exist in db!', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: 2,
        saloon_id: randomNumber,
        start_t: '2023-12-28T08:00:00.492Z',
        end_t: '2023-12-28T11:00:00.492Z',
      });

    expect(x.body.message).toBe('please make sure that data is correct!!');
  });

  it('fails if saloon does not exist in db!', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: 2,
        saloon_id: 67890,
        start_t: '2023-12-28T08:00:00.492Z',
        end_t: '2023-12-28T11:00:00.492Z',
      });

    expect(x.body.message).toBe('please make sure that data is correct!!');
  });

  it('fails if movie does not exist in db!', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .post(`/sans/create`)
      .set('auth', `ut ${token}`)
      .send({
        movie_id: 1123456,
        saloon_id: 1,
        start_t: '2023-12-28T08:00:00.492Z',
        end_t: '2023-12-28T11:00:00.492Z',
      });

    expect(x.body.message).toBe('please make sure that data is correct!!');
  });

  // get Sans

  it('not found if id is incorrect', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/sans/${1234567}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(404);
  });

  it('successfuly return sans if is is correct', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const getSansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .get(`/sans/${getSansId}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(200);
  });

  //get-all-sanses

  it('successfuly return at  least 10 sanses ', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/sans/get-all`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.length).not.toBe(0);
  });

  it('successfuly return sanses based on page and limit', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/sans/get-all?limit=${randomNumberQuery}&page=${randomNumberQuery}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(200);
  });

  // get singleSans By MovieId

  it('successfuly return single sans if id is true', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const sansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .get(`/sans/${sansId}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(200);
  });

  it('successfuly return sans with movieId', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const movieId = GetContext('movieId');

    const x = await request(app.getHttpServer())
      .get(`/sans/sansByMovie/${movieId}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.length).not.toBe(0);
  });

  it('does not return sans with wrong movieId', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/sans/sansByMovie/${1231124}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(400);
  });

  it('does not return sans with wrong movieId', async () => {
    const token = GetContext('token1');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/sans/sansByMovie/${1231124}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.statusCode).toBe(400);
  });
});
