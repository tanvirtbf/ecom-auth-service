import fs from "fs";
import path from "path";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "******",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });

            // Generate the access token and refresh token
            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (error) {
                const err = createHttpError(
                    500,
                    "Failed to read the private key",
                );
                next(err);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h",
                issuer: "auth-service",
            });
            const refreshToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "7d",
                issuer: "auth-service",
            });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
                sameSite: "strict",
                secure: false,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: "strict",
                secure: false,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
