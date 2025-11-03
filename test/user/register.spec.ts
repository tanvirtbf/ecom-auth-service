import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
    // jodi sob field dey tahole eita use hobe
    describe("Given all fields", () => {
        it("should return 201 status", async () => {
            // AAA
            // Arrange
            // Act
            // Assert

            // Arrange
            const userData = {
                firstName: "Tanvir",
                lastName: "Ahmed",
                email: "tanvir@gmail.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(
                (response.header as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });
    });

    // jodi kono field missing hoy tahole eita use hobe
    describe("Fields are missing", () => {});
});
