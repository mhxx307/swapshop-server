// import 'reflect-metadata';
// import path from 'path';
// import {
//     Article,
//     Category,
//     Comment,
//     Conversation,
//     Favorite,
//     Message,
//     Role,
//     User,
//     UserRole,
// } from './entities';
// import { DataSource } from 'typeorm';

// const PostgresDataSource = new DataSource({
//     type: 'postgres',
//     host: 'localhost',
//     port: 5432,
//     username: process.env.USERNAME_DB_DEV,
//     password: process.env.PASSWORD_DB_DEV,
//     database: process.env.DATABASE_NAME,
//     logging: true,
//     synchronize: true,
//     entities: [
//         User,
//         Comment,
//         Article,
//         Category,
//         Role,
//         UserRole,
//         Favorite,
//         Message,
//         Conversation,
//     ],
//     migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
// });

// export default PostgresDataSource;

// "typeorm": "^0.3.11",

export const a = 1;
