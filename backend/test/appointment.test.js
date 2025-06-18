// test/appointment.test.js
import request from "supertest";
import app from "../index.js";

const loginAdmin = async () => {
  const res = await request(app).post("/auth/login").send({
    username: "admin",       // este usuario debe existir
    password: "admin123"
  });
  return res.body.token;
};

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

let token;
let appointmentId;

describe("Appointment API", () => {
  beforeAll(async () => {
    token = await loginAdmin();
  });

  test("Debería crear una nueva cita", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: getTomorrow(),
        startTime: "10:00",
        endTime: "10:30",
        reason: "Chequeo general",
        patientId: 1,
        professionalId: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    appointmentId = res.body.id;
  });

  test("Debería rechazar una cita en fecha pasada", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2000-01-01",
        startTime: "10:00",
        endTime: "10:30",
        reason: "Test",
        patientId: 1,
        professionalId: 1
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("Debería reagendar una cita", async () => {
    const res = await request(app)
      .put(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: getTomorrow(),
        startTime: "11:00",
        endTime: "11:30",
        reason: "Reagendada"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toMatch(/rescheduled/i);
  });

  test("Debería listar citas filtradas por paciente", async () => {
    const res = await request(app)
      .get("/appointments?patientId=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
