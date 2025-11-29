import { DataSource } from "typeorm";
import request from "supertest";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let accessToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        accessToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should create tenant in the database", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            // Act
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it("should return 401 status code if user not authenticated!", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it("should return 403 status code if user is not Admin", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken};`])
                .send(tenantData);

            // Assert
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(response.statusCode).toBe(403);
            expect(tenants).toHaveLength(0);
        });
    });
});
