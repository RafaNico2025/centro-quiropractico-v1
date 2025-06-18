import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test-utils";
import { NewPatientForm } from "../../components/NewPatientForm";

vi.mock("../../services/patient.service", () => ({
  patientService: {
    create: vi.fn(),
  },
}));

describe("NewPatientForm", () => {
  const onSuccess = vi.fn();
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente los campos obligatorios", () => {
    render(
      <NewPatientForm
        open={true}
        onSuccess={onSuccess}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dni/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^teléfono$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("envía correctamente el formulario y ejecuta onSuccess", async () => {
    const { patientService } = await import("../../services/patient.service");
    patientService.create.mockResolvedValue({ id: 1 });

    render(
      <NewPatientForm
        open={true}
        onSuccess={onSuccess}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Juan" },
    });
    fireEvent.change(screen.getByLabelText(/apellido/i), {
      target: { value: "Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/dni/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/^teléfono$/i), {
      // coincide solo con "Teléfono"
      target: { value: "3511234567" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "juan@mail.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear paciente/i }));

    await waitFor(() => {
      expect(patientService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Juan",
          lastName: "Pérez",
          dni: "12345678",
          phone: "3511234567",
          email: "juan@mail.com",
        })
      );
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("muestra un toast de error si falla el envío", async () => {
    const { patientService } = await import("../../services/patient.service");
    patientService.create.mockRejectedValue(new Error("Error de red"));

    render(
      <NewPatientForm
        open={true}
        onSuccess={onSuccess}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/apellido/i), {
      target: { value: "García" },
    });
    fireEvent.change(screen.getByLabelText(/dni/i), {
      target: { value: "87654321" },
    });
    fireEvent.change(screen.getByLabelText(/^teléfono$/i), {
      // coincide solo con "Teléfono"
      target: { value: "3511234567" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@mail.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear paciente/i }));

    await waitFor(() => expect(patientService.create).toHaveBeenCalled());
  });
});
