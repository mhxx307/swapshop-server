require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';

import { User } from './entities';
import { HelloResolver, UserResolver } from './resolvers';

const main = async () => {
    const app = express();

    const PostgresDataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: process.env.USERNAME_DB,
        password: process.env.PASSWORD_DB,
        database: process.env.DATABASE_NAME,
        logging: true,
        synchronize: true,
        entities: [User],
    });

    PostgresDataSource.initialize()
        .then(() => {
            console.log('Data Source has been initialized!');
        })
        .catch((err) => {
            console.error('Error during Data Source initialization', err);
        });

    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver],
            validate: false,
        }),
    });
    await server.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token }),
        })
    );

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
};

main();
