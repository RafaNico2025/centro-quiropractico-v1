import { Appointments, Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';
import { sendAppointmentNotification } from '../../services/notification.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - date
 *         - startTime
 *         - endTime
 *         - patientId
 *         - professionalId
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha de la cita
 *         startTime:
 *           type: string
 *           format: time
 *           description: Hora de inicio de la cita
 *         endTime:
 *           type: string
 *           format: time
 *           description: Hora de fin de la cita
 *         reason:
 *           type: string
 *           description: Motivo de la cita
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         patientId:
 *           type: integer
 *           description: ID del paciente
 *         professionalId:
 *           type: integer
 *           description: ID del profesional
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show, rescheduled]
 *           default: scheduled
 *           description: Estado de la cita
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crear una nueva cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Error en la solicitud o horario no disponible
 *       500:
 *         description: Error del servidor
 */
const createAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, notes, patientId, professionalId } = req.body;

    // Verificar disponibilidad del horario
    const existingAppointment = await Appointments.findOne({
      where: {
        professionalId,
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
        ]
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Ya existe un turno en ese horario' });
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

    const patient = await Patients.findByPk(patientId);

    // Enviar notificaciones
    await sendAppointmentNotification(appointment, patient);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error al crear la cita' });
  }
};

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener todas las citas
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar citas
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar citas
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: integer
 *         description: ID del profesional para filtrar citas
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: ID del paciente para filtrar citas
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show, rescheduled]
 *         description: Estado de las citas a filtrar
 *     responses:
 *       200:
 *         description: Lista de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Error del servidor
 */
const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, professionalId, patientId, status } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await Appointments.findAll({
      where,
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'phone', 'email'] },
        { model: Users, as: 'professional', attributes: ['name', 'lastName'] }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener las citas' });
  }
};

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Datos de la cita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findByPk(id, {
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'phone', 'email'] },
        { model: Users, as: 'professional', attributes: ['name', 'lastName'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ message: 'Error al obtener la cita' });
  }
};

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Actualizar una cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      startTime,
      endTime,
      reason,
      notes,
      patientId,
      professionalId,
      status
    } = req.body;

    const appointment = await Appointments.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Verificar disponibilidad del nuevo horario si se está cambiando
    if (date || startTime || endTime || professionalId) {
      const newDate = date || appointment.date;
      const newStartTime = startTime || appointment.startTime;
      const newEndTime = endTime || appointment.endTime;
      const newProfessionalId = professionalId || appointment.professionalId;

      const existingAppointment = await Appointments.findOne({
        where: {
          id: { [Op.ne]: id },
          professionalId: newProfessionalId,
          date: newDate,
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [newStartTime, newEndTime]
              }
            },
            {
              endTime: {
                [Op.between]: [newStartTime, newEndTime]
              }
            }
          ]
        }
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Ya existe un turno en ese horario' });
      }
    }

    await appointment.update({
      date,
      startTime,
      endTime,
      reason,
      notes,
      patientId,
      professionalId,
      status
    });

    res.json(appointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ message: 'Error al actualizar la cita' });
  }
};

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Eliminar una cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita eliminada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    await appointment.destroy();
    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ message: 'Error al eliminar la cita' });
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
}; 