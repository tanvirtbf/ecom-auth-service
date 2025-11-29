import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";

export class TenantService {
    private tenantRepository: Repository<Tenant>;
    constructor(tenantRepository: Repository<Tenant>) {
        this.tenantRepository = tenantRepository;
    }

    async create(tenantData: ITenant) {
        try {
            const tenant = await this.tenantRepository.save(tenantData);
            return tenant;
        } catch (error) {
            const err = createHttpError(
                500,
                "Error while persist Tenant data in the Database",
            );
            throw err;
        }
    }
}
