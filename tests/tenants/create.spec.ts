import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
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
            await request(app).post("/tenants").send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
