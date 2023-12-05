// import { DataSource } from "typeorm";
// import { User } from "./entities/user.entity";
// import { Movie } from "./entities/movie.entity";
// import { Saloon } from "./entities/saloon.entity";
// import { Sans } from "./entities/sans.entity";
// import { Ticket } from "./entities/ticket.entity";



// const PostgresDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: +process.env.DB_PORT,
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database:
//     process.env.ENV === 'TEST'
//       ? process.env.DB_Name_Test
//       : process.env.DB_NAME,
//   entities: [User, Movie, Saloon, Sans, Ticket],
//   synchronize: true,

// })