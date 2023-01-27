require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

const app = express();

const PostgresDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
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
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
