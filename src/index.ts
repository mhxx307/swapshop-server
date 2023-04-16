import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
require('dotenv').config();
import { buildDataLoaders } from './utils/dataLoaders';
import express from 'express';
import cors from 'cors';
import { buildSchema } from 'type-graphql';
import mongoose from 'mongoose';
import session from 'express-session';
const MongoDBStore = require('connect-mongodb-session')(session);
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
// import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

import path from 'path';
import {
    Article,
    Category,
    Comment,
    Conversation,
    Favorite,
    Message,
    Review,
    Role,
    User,
    UserRole,
    Report,
    Notification,
} from './entities';

import {
    UserResolver,
    ArticleResolver,
    CommentResolver,
    CategoryResolver,
    RoleResolver,
    UserRoleResolver,
    FavoriteResolver,
    MessageResolver,
    ConversationResolver,
    ReviewResolver,
    ReportResolver,
    NotificationResolver,
} from './resolvers';
import {
    COOKIE_MAX_AGE,
    COOKIE_NAME,
    COLLECTION_SESSION_NAME,
    __prod__,
} from './constants';
import { IMyContext } from './types/context';
import { createConnection } from 'typeorm';
import { v4 } from 'uuid';
// import PostgresDataSource from './data-source';

const main = async () => {
    const app = express();

    app.use(
        cors({
            origin: __prod__
                ? [
                      process.env.WEBSITE_URL_PROD as string,
                      process.env.ADMIN_URL_PROD as string,
                  ]
                : [
                      process.env.WEBSITE_URL_DEV as string,
                      process.env.ADMIN_URL_DEV as string,
                  ],
            credentials: true,
        }),
    );

    const connection = await createConnection({
        type: 'postgres',
        ...(__prod__
            ? {
                  url: process.env.DATABASE_URL,
                  database: process.env.DATABASE_NAME,
                  username: process.env.USERNAME_DB,
                  password: process.env.PASSWORD_DB,
                  host: process.env.HOST_DB,
              }
            : {
                  database: 'second_chance_db',
                  username: 'postgres',
                  password: '123456',
              }),
        logging: true,
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
            Review,
            Report,
            Notification,
        ],
        migrations: [path.join(__dirname, '/migrations/*')],
        cli: {
            migrationsDir: 'src/migrations',
        },
    });

    if (__prod__) await connection.runMigrations();

    // PostgresDataSource.initialize()
    //     .then(() => {
    //         console.log('Data Source has been initialized!');
    //     })
    //     .catch((err) => {
    //         console.error('Error during Data Source initialization', err);
    //     });

    // Session/Cookie store
    const mongoUrl = process.env.MONGO_CONNECTION_URL_DEV_PROD as string;
    mongoose
        .connect(mongoUrl)
        .then(() => {
            console.log('Connected to mongodb');
        })
        .catch((err) => {
            console.log(err);
        });

    const store = new MongoDBStore(
        {
            uri: mongoUrl,
            collection: COLLECTION_SESSION_NAME,

            // By default, sessions expire after 2 weeks. The `expires` option lets
            // you overwrite that by setting the expiration in milliseconds
            expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds

            // Lets you set options passed to `MongoClient.connect()`. Useful for
            // configuring connectivity or working around deprecation warnings.
            connectionOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
            },
        },
        (error: Error) => {
            if (error) {
                console.log(error);
            } else {
                console.log('store created');
            }
        },
    );

    // Catch errors
    store.on('error', (error: Error) => {
        console.log(error);
    });

    app.set('trust proxy', 1);
    app.enable('trust proxy');

    app.use(
        session({
            genid: () => {
                return v4(); // use UUIDs for session IDs
            },
            name: COOKIE_NAME,
            secret: process.env.SESSION_SECRET as string,
            cookie: {
                maxAge: COOKIE_MAX_AGE,
                httpOnly: true,
                secure: __prod__, // cookie only work in https
                sameSite: __prod__ ? 'none' : 'lax', // protection against CSRF,
                // domain: __prod__ ? '.vercel.app' : undefined,
            },
            store: store,
            // Boilerplate options, see:
            // * https://www.npmjs.com/package/express-session#resave
            // * https://www.npmjs.com/package/express-session#saveuninitialized
            resave: false,
            saveUninitialized: false, // do not save empty sessions, right from the start,
            proxy: true,
        }),
    );

    // setting up apollo server
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                UserResolver,
                ArticleResolver,
                CommentResolver,
                CategoryResolver,
                RoleResolver,
                UserRoleResolver,
                FavoriteResolver,
                MessageResolver,
                ConversationResolver,
                ReviewResolver,
                ReportResolver,
                NotificationResolver,
            ],
            validate: false,
        }),
        plugins: [
            __prod__
                ? ApolloServerPluginLandingPageProductionDefault({
                      includeCookies: true,
                  })
                : ApolloServerPluginLandingPageLocalDefault({
                      includeCookies: true,
                  }),
        ],
        introspection: true,
    });
    await server.start();

    app.use(
        '/graphql',
        cors({
            origin: __prod__
                ? [
                      process.env.WEBSITE_URL_PROD as string,
                      process.env.ADMIN_URL_PROD as string,
                  ]
                : [
                      process.env.WEBSITE_URL_DEV as string,
                      process.env.ADMIN_URL_DEV as string,
                  ],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req, res }): Promise<IMyContext> => ({
                req,
                res,
                connection,
                dataLoaders: buildDataLoaders(),
            }),
        }),
    );

    // run server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
};

main();
