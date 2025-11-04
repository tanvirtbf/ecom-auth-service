import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";

const app = express();

app.get("/", async (req, res) => {
    res.send("Welcome to Auth services");
});

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;

// docker build -t auth-service:dev -f docker/development/Dockerfile .

// docker run --rm -it -v "${PWD}:/usr/src/app" -v /usr/src/app/node_modules --env-file "${PWD}/.env" -p 5501:5501 -e NODE_ENV=development auth-service:dev
