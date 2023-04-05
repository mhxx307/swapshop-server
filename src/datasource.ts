import 'reflect-metadata';
import path from 'path';
import {
    Article,
    Category,
    Comment,
    Conversation,
    Favorite,
    Message,
    Role,
    User,
    UserRole,
} from './entities';
import { DataSource } from 'typeorm';
import { __prod__ } from './constants';

const PostgresDataSource = new DataSource({
    type: 'postgres',
    ...(__prod__
        ? { url: process.env.DATABASE_URL }
        : {
              database: process.env.DATABASE_NAME,
              username: process.env.USERNAME_DB_DEV,
              password: process.env.PASSWORD_DB_DEV,
          }),
    logging: true,
    host: __prod__ ? process.env.HOST_PROD : 'localhost',
    port: __prod__ ? 6543 : 5432,
    ...(__prod__
        ? {
              extra: {
                  ssl: {
                      rejectUnauthorized: false,
                  },
              },
              ssl: true,
          }
        : {}),
    ...(__prod__ ? {} : { synchronize: true }),
    entities: [
        User,
        Comment,
        Article,
        Category,
        Role,
        UserRole,
        Favorite,
        Message,
        Conversation,
    ],
    migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
});

export default PostgresDataSource;
