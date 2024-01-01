import * as request from 'supertest';
import { SetContext, printContext, GetContext, app } from './001auth.e2e-spec';

const randomNumber = Math.floor(Math.random() * 100000000);
const randomNumberQuery = Math.floor(Math.random() * 10);

export function generateNumericString(length: number): string {
  const res = Array.from({ length }).reduce((acc) => {
    // return acc + '1';
    return acc + String(Math.floor(Math.random() * 9));
  }, '');
  return String(res);
}

describe('saloonController (e2e)', () => {
  it('/ (GET)', () => {
    printContext;
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('fail if saloon already exist', async () => {
    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .post(`/saloon/create`)
      .set('auth', `ut ${token}`)
      .send({
        role: 'admin',
        name: 'saloon d',
        numOfSeat: 150,
        numOfseatPerRow: 50,
      });

    expect(x.body.message).toBe('this saloon already exist!!');
  });

  it('successfuly create saloon if admin information is correct', async () => {
    const token = GetContext('token1');

    generateNumericString(4);

    const x = await request(app.getHttpServer())
      .post(`/saloon/create`)
      .set('auth', `ut ${token}`)
      .send({
        role: 'admin',
        name: generateNumericString(4),
        numOfSeat: 150,
        numOfseatPerRow: 50,
      });

    expect(x.statusCode).toBe(201);

    SetContext('saloonId', x.body.id);
    SetContext('saloonName', x.body.name);

    console.log(x.body, 'this is a body y');
  });

  // all-saloon

  it('successfuly return at least 10 saloons ', async () => {
    const token = GetContext('token1');

    generateNumericString(4);
    const x = await request(app.getHttpServer())
      .get(`/saloon/getAll`)
      .set('auth', `ut ${token}`)
      .send({
        role: 'admin',
      });

    expect(x.body.length).not.toBe(0);
  });

  it('successfuly return data based on page & limit', async () => {
    const token = GetContext('token1');

    generateNumericString(4);
    const x = await request(app.getHttpServer())
      .get(
        `/saloon/getAll?page=${randomNumberQuery}&limit=${randomNumberQuery}`,
      )
      .set('auth', `ut ${token}`)
      .send({
        role: 'admin',
      });

    expect(x.statusCode).toBe(200);
  });

  it('getting saloons with full text search', async () => {
    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .get(`/saloon/getall?name=5771`)
      .set('auth', `ut ${token}`)
      .send({
        role: 'admin',
      });

    expect(x.body.length).not.toBe(0);
  });

  //sansesbyMovie

  it("not getting the saloons if doesn't exist!!", async () => {
    expect.assertions(1);

    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .get(`/saloon/getall?name=mrtr`)
      .set('auth', `ut ${token}`)
      .send({ role: 'admin' });

    expect(x.body.length).toBe(0);
  });

  //get-single-saloon
  it('fail if saloon-id is incorrect', async () => {
    expect.assertions(1);

    const token = GetContext('token1');

    const x = await request(app.getHttpServer())
      .get(`/saloon/Single/${randomNumber}`)
      .set('auth', `ut ${token}`)
      .send({ role: 'admin' });

    expect(x.body.message).toBe('this saloon does not exist!');
  });

  it('successfuly return saloon if id is correct', async () => {
    expect.assertions(1);

    const token = GetContext('token1');
    const saloonId = GetContext('saloonId');

    const x = await request(app.getHttpServer())
      .get(`/saloon/Single/${saloonId}`)
      .set('auth', `ut ${token}`)
      .send({ role: 'admin' });

    expect(x.body.length).toBe(1);
  });

  // edit saloon

  it('return true if user provided correct data!', async () => {
    const token = GetContext('token');
    expect.assertions(1);

    const saloonId = GetContext('saloonId');

    const x = await request(app.getHttpServer())
      .post(`/saloon/edit/${saloonId}`)
      .set('auth', `ut ${token}`)
      .send({
        name: 'saloon rrrrrrrrrrrr',
        numOfSeat: 100,
        numOfseatPerRow: 10,
      });

    expect(x.statusCode).toBe(201);
  });
});
