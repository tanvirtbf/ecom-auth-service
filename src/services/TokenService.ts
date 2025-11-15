import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    async createAccessToken(payload: JwtPayload) {
        // Generate the access token and refresh token
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (error) {
            const err = createHttpError(500, "Failed to read the private key");
            throw err;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    }

    async createRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "7d",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        // persist refresh token in the database
        const mili_seconds_in_a_year = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = await this.refreshTokenRepository.save({
            expiresAt: new Date(Date.now() + mili_seconds_in_a_year),
            user: user,
        });

        return newRefreshToken;
    }
}
