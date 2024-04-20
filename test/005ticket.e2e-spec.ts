import * as request from 'supertest';
import { GetContext, SetContext } from './001auth.e2e-spec';
import { app } from './001auth.e2e-spec';
import { generateNumericString } from './003saloon.e2e-spec';

let startDate = new Date(
  new Date().getTime() + 24 * 60 * 60 * 1000,
).toISOString();

let endtDate = new Date(
  new Date().getTime() + 24 * 60 * 60 * 1000,
).toISOString();

describe('saloonController (e2e)', () => {
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
  });

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
  it('successfuly create sans if information is correct', async () => {
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
});

describe('ticketController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // ticket reservation

  it('fail if sansId does not exist in db!', async () => {
    const token = GetContext('token');

    expect.assertions(1);

    const x = await request(app.getHttpServer())
      .get(`/ticket/reserve`)
      .set('auth', `ut ${token}`)
      .send({
        seatNumbers: [10],
        sansId: GetContext('sansId') + 12142411,
      });

    expect(x.statusCode).toBe(404);
  });

  it('successfully reserve tickets!', async () => {
    const token = GetContext('token');

    expect.assertions(1);
    const sansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .post(`/ticket/reserve`)
      .set('auth', `ut ${token}`)
      .send({
        seatNumbers: [10, 11, 12],
        sansId: sansId,
      });

    expect(x.text).toBe('ok');
  });

  it('fail if seat already taken !', async () => {
    const token = GetContext('token');

    expect.assertions(1);
    const sansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .post(`/ticket/reserve`)
      .set('auth', `ut ${token}`)
      .send({
        seatNumbers: [10],
        sansId: sansId,
      });

    expect(x.statusCode).toBe(400);
  });

  //myTickets

  it('successfully return tickets!', async () => {
    const token = GetContext('token');

    expect.assertions(1);
    const sansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .get(`/ticket/my-tickets?sansId=${sansId}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.length).not.toBe(0);
  });

  it('fails if there is no ticket with sansId!', async () => {
    const token = GetContext('token');

    expect.assertions(1);
    const sansId = GetContext('sansId');

    const x = await request(app.getHttpServer())
      .get(`/ticket/my-tickets?sansId=${sansId}`)
      .set('auth', `ut ${token}`)
      .send({});

    expect(x.body.length).not.toBe(0);
  });
});
