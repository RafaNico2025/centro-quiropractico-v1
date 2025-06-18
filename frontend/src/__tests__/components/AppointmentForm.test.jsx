import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../test-utils";
import { AppointmentForm } from "../../components/AppointmentForm";
import { waitForElementToBeRemoved } from "@testing-library/react";
import React from "react";

// Importar los mocks
import "../__mocks__/ui-mocks";

// Mocks de servicios
vi.mock("../../services/appointment.service", () => ({
  appointmentService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../services/user.service", () => ({
  userService: {
    getPatients: vi
      .fn()
      .mockResolvedValue([{ id: 1, firstName: "Juan", lastName: "Pérez" }]),
    getProfessionals: vi
      .fn()
      .mockResolvedValue([{ id: 1, name: "Dr", lastName: "Smith" }]),
  },
}));

describe("AppointmentForm", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    appointment: null,
  };

  it("renderiza el formulario correctamente", async () => {
    render(<AppointmentForm {...defaultProps} />);

    expect(await screen.findByText("Nueva Cita")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha *", { selector: "#date" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^hora de inicio \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^hora de fin \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^motivo \*$/i)).toBeInTheDocument();
  });

  it("muestra título diferente cuando es para reagendar", async () => {
    render(
      <AppointmentForm
        {...defaultProps}
        appointment={{
          id: 1,
          date: "2025-06-04",
          startTime: "10:00",
          endTime: "11:00",
          reason: "Consulta",
          patientId: 1,
          professionalId: 1,
        }}
      />
    );

    expect(await screen.findByText("Reagendar Cita")).toBeInTheDocument();
  });

  it("muestra campos vacíos al abrir nueva cita", async () => {
    render(<AppointmentForm {...defaultProps} />);

    // Esperar a que desaparezca el loader
    await waitForElementToBeRemoved(() => screen.getByText(/cargando/i));

    expect(screen.getByLabelText(/^fecha \*$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^hora de inicio \*$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^hora de fin \*$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^motivo \*$/i)).toHaveValue("");
  });
});
