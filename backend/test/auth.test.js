// test/auth.test.js
import request from "supertest";
import app from "../index.js"; // asegurate de exportar tu app desde index.js

const generateUniqueUser = () => ({
  username: `user_${Date.now()}`,
  password: "Clave123!",
  name: "Test",
  lastName: "User",
  email: `test${Date.now()}@mail.com`,
  phone: "3515555555",
  dni: `${Math.floor(Math.random() * 90000000) + 10000000}`,
  role: "patient"
});

let testUser;
let token;

describe("Auth API", () => {
  beforeAll(() => {
    testUser = generateUniqueUser();
  });

  test("Debería registrar un nuevo usuario", async () => {
    const res = await request(app).post("/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("username", testUser.username);
  });

  test("Debería loguear al usuario y devolver un token", async () => {
    const res = await request(app).post("/auth/login").send({
      username: testUser.username,
      password: testUser.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  test("Debería fallar si la contraseña es incorrecta", async () => {
    const res = await request(app).post("/auth/login").send({
      username: testUser.username,
      password: "incorrecta"
    });

    expect(res.statusCode).toBe(401);
  });
});
