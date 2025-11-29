import { DataSource } from "typeorm";
import request from "supertest";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /auth/self", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
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
    });
});
