/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
import 'reflect-metadata';
import { buildDataLoaders } from './utils/dataLoaders';
import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { buildSchema } from 'type-graphql';
import mongoose from 'mongoose';
import session from 'express-session';
const MongoDBStore = require('connect-mongodb-session')(session);

import { Article, User, Comment, Category } from './entities';
import {
    UserResolver,
    ArticleResolver,
    CommentResolver,
    CategoryResolver,
} from './resolvers';
import {
    COOKIE_MAX_AGE,
    COLLECTION_SESSION_NAME,
    __prod__,
    COOKIE_NAME,
} from './constants';
import { IMyContext } from './types';

const main = async () => {
    const app = express();

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        }),
    );

    // postgres connection
    const PostgresDataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: process.env.USERNAME_DB_DEV,
        password: process.env.PASSWORD_DB_DEV,
        database: process.env.DATABASE_NAME,
        logging: true,
        synchronize: true,
        entities: [User, Comment, Article, Category],
    });

    PostgresDataSource.initialize()
        .then(() => {
            console.log('Data Source has been initialized!');
        })
        .catch((err) => {
            console.error('Error during Data Source initialization', err);
        });

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

    app.use(
        session({
            name: COOKIE_NAME,
            secret: process.env.SESSION_SECRET_DEV_PROD as string,
            cookie: {
                maxAge: COOKIE_MAX_AGE,
                httpOnly: true,
                secure: __prod__, // cookie only work in https
                sameSite: 'lax', // protection against CSRF
            },
            store: store,
            // Boilerplate options, see:
            // * https://www.npmjs.com/package/express-session#resave
            // * https://www.npmjs.com/package/express-session#saveuninitialized
            resave: false,
            saveUninitialized: false, // do not save empty sessions, right from the start
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
    });
    await server.start();

    app.use(
        '/graphql',
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req, res }): Promise<IMyContext> => ({
                req,
                res,
                dataLoaders: buildDataLoaders(),
            }),
        }),
    );

    // run server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
};

main();
