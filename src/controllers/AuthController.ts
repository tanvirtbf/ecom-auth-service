import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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
}
