import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });
            return refreshToken === null;
        } catch (err) {
            logger.error("Error while getting the refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    }, // ekhane isRevoked aijonno use kora hoiche jate bujhi je jei refreshToken ami browser er cookie theke peye user ke validate korchi seta refreshToken database e ache kina . karon dhoren user first time login korlo . Token A create . jodi database theke kono vabe token A er against e data delete hoye jay but browser e to expires time porjonto thakbe . but sei token to deleted . and browser e thaka token valid . tai easily je keu seta diye system e access korte parbe . tai ekhane check kora hocche je jei token pauya gese seta ki database e ache ki nai . eta security isshue
});
