import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import createHttpError from "http-errors";
import { TenantRequest } from "../types";

export class TenantController {
    private tenantService: TenantService;

    constructor(tenantService: TenantService) {
        this.tenantService = tenantService;
    }

    async register(req: TenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        if (!name || !address) {
            const err = createHttpError(
                400,
                "Tenant Name or Address are missing!",
            );
            next(err);
            return;
        }

        try {
            const tenant = await this.tenantService.create({ name, address });
            res.status(201).json({ data: tenant });
        } catch (error) {
            const err = createHttpError(
                500,
                "Error while hiting Tenant Controller!",
            );
            next(err);
            return;
        }
    }
}
