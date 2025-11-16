import { NextFunction, Response } from "express";
import { LoginUserRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const accessToken =
                await this.tokenService.createAccessToken(payload);

            const refreshToken = await this.tokenService.createRefreshToken({
                ...payload,
                id: newRefreshToken.id,
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

    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        // validator
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.debug("New Request for login a user!", {
            email: email,
            password: "********",
        });

        try {
            // check if username (email) is already exists
            const user = await this.userService.checkUserEmailIsExist(email);
            if (!user) {
                const err = createHttpError(
                    400,
                    "Email or Password does not match!",
                );
                throw err;
            }

            // compare password
            const isMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );
            if (!isMatch) {
                const err = createHttpError(
                    500,
                    "Email or password does not match!",
                );
                throw err;
            }

            // generate token
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken =
                await this.tokenService.createAccessToken(payload);

            // Persist Refresh token in the database
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = await this.tokenService.createRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            // add tokens to cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
                sameSite: "strict",
                secure: false,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 365,
                sameSite: "strict",
                secure: false,
            });

            // return the response (id)
            res.status(200).json({
                message: "user login successfully!",
                id: user.id,
            });
        } catch (error) {
            next(error);
        }
    }
}
