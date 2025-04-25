import { Appointments, Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';

// Crear un nuevo turno
const createAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, notes, patientId, professionalId } = req.body;

    // Validar que no exista un turno en el mismo horario
    const existingAppointment = await Appointments.findOne({
      where: {
        date,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          }
        ],
        professionalId
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Ya existe un turno en ese horario' });
    }

    const appointment = await Appointments.create({
      date,
      startTime,
      endTime,
      reason,
      notes,
      patientId,
      professionalId,
      status: 'scheduled'
    });

    // Aquí se podría agregar la lógica para enviar notificación por WhatsApp
    // TODO: Implementar notificación por WhatsApp

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ message: 'Error al crear el turno' });
  }
};

// Obtener todos los turnos
const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await Appointments.findAll({
      where,
      include: [
        { model: Patients },
        { model: Users, as: 'professional' }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ message: 'Error al obtener los turnos' });
  }
};

// Obtener un turno por ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findByPk(id, {
      include: [
        { model: Patients },
        { model: Users, as: 'professional' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error al obtener turno:', error);
    res.status(500).json({ message: 'Error al obtener el turno' });
  }
};

// Actualizar un turno
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, reason, notes, status } = req.body;

    const appointment = await Appointments.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    // Si se cambia la fecha u hora, validar que no exista conflicto
    if (date || startTime || endTime) {
      const existingAppointment = await Appointments.findOne({
        where: {
          id: { [Op.ne]: id },
          date: date || appointment.date,
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [startTime || appointment.startTime, endTime || appointment.endTime]
              }
            },
            {
              endTime: {
                [Op.between]: [startTime || appointment.startTime, endTime || appointment.endTime]
              }
            }
          ],
          professionalId: appointment.professionalId
        }
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'Ya existe un turno en ese horario' });
      }
    }

    await appointment.update({
      date: date || appointment.date,
      startTime: startTime || appointment.startTime,
      endTime: endTime || appointment.endTime,
      reason: reason || appointment.reason,
      notes: notes || appointment.notes,
      status: status || appointment.status
    });

    // Si el estado cambió a cancelado, enviar notificación
    if (status === 'cancelled') {
      // TODO: Implementar notificación de cancelación
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ message: 'Error al actualizar el turno' });
  }
};

// Eliminar un turno
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    await appointment.destroy();
    res.json({ message: 'Turno eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ message: 'Error al eliminar el turno' });
  }
};

export default {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
}; 