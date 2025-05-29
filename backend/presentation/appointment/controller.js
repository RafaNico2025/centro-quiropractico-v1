import { Appointments, Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';
import { sendAppointmentNotification, sendAppointmentCancellation, sendAppointmentReminder, sendAppointmentRequest } from '../../services/notification.service.js';

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
    const createdBy = req.user.id;

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
      createdBy,
      status: 'scheduled'
    });

    // Obtener datos del paciente y profesional para las notificaciones
    const [patient, professional] = await Promise.all([
      Patients.findByPk(patientId, {
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
      }),
      Users.findByPk(professionalId, {
        attributes: ['id', 'name', 'lastName', 'email']
      })
    ]);

    // Enviar notificaciones con todos los datos
    const notificationResults = await sendAppointmentNotification(appointment, patient, professional);
    
    console.log('📧 Resultados de notificación:', notificationResults);

    // Actualizar el flag de notificación enviada
    await appointment.update({ 
      notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
    });

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
        { 
          model: Patients, 
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
          required: true
        },
        { 
          model: Users, 
          as: 'professional',
          attributes: ['id', 'name', 'lastName', 'email'],
          required: true
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    // Asegurarse de que las fechas se envíen en el formato correcto
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment.toJSON(),
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las citas',
      error: error.message 
    });
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
      status,
      cancellationReason
    } = req.body;

    const appointment = await Appointments.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Guardar el estado anterior para detectar cambios
    const previousStatus = appointment.status;

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

    // Actualizar la cita
    await appointment.update({
      date,
      startTime,
      endTime,
      reason,
      notes,
      patientId,
      professionalId,
      status,
      cancellationReason: status === 'cancelled' ? cancellationReason : appointment.cancellationReason,
      updatedBy: req.user.id
    });

    // Enviar notificación de cancelación si el estado cambió a cancelado
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      try {
        // Obtener datos del paciente y profesional para las notificaciones
        const [patient, professional] = await Promise.all([
          Patients.findByPk(appointment.patientId, {
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          }),
          Users.findByPk(appointment.professionalId, {
            attributes: ['id', 'name', 'lastName', 'email']
          })
        ]);

        if (patient) {
          const notificationResults = await sendAppointmentCancellation(
            appointment, 
            patient, 
            professional,
            cancellationReason || 'No se especificó motivo'
          );
          
          console.log('📧 Notificación de cancelación enviada:', notificationResults);
        }
      } catch (notificationError) {
        console.error('❌ Error al enviar notificación de cancelación:', notificationError);
        // No fallar la actualización por errores en notificaciones
      }
    }

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

/**
 * @swagger
 * /appointments/{id}/send-reminder:
 *   post:
 *     summary: Enviar recordatorio manual de cita
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
 *         description: Recordatorio enviado exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const sendAppointmentReminderManual = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la cita con paciente y profesional
    const appointment = await Appointments.findByPk(id, {
      include: [
        { 
          model: Patients, 
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
          required: true
        },
        { 
          model: Users, 
          as: 'professional',
          attributes: ['id', 'name', 'lastName', 'email'],
          required: true
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Verificar que la cita no esté cancelada
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'No se puede enviar recordatorio de una cita cancelada' });
    }

    // Enviar recordatorio
    const notificationResults = await sendAppointmentReminder(
      appointment, 
      appointment.Patient, 
      appointment.professional
    );

    // Actualizar flag de recordatorio enviado
    await appointment.update({ 
      reminderSent: notificationResults.email?.success || notificationResults.whatsapp?.success,
      reminderSent24h: true // Marcar como enviado manualmente
    });

    console.log('📧 Recordatorio manual enviado:', notificationResults);

    res.json({
      message: 'Recordatorio enviado exitosamente',
      results: notificationResults
    });

  } catch (error) {
    console.error('Error al enviar recordatorio:', error);
    res.status(500).json({ message: 'Error al enviar recordatorio' });
  }
};

/**
 * @swagger
 * /appointments/request:
 *   post:
 *     summary: Solicitar una cita desde el dashboard del paciente
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *               - preferenciaDia
 *               - preferenciaHora
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la consulta
 *               preferenciaDia:
 *                 type: string
 *                 description: Preferencia de día para la cita
 *               preferenciaHora:
 *                 type: string
 *                 description: Preferencia de hora para la cita
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Solicitud de cita enviada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
const requestAppointment = async (req, res) => {
  try {
    const { motivo, preferenciaDia, preferenciaHora, notas } = req.body;
    const userId = req.user.id;

    // Obtener datos del usuario que solicita la cita
    const user = await Users.findByPk(userId, {
      attributes: ['id', 'name', 'lastName', 'email', 'phone']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Crear el objeto de solicitud de cita
    const appointmentRequest = {
      motivo,
      preferenciaDia,
      preferenciaHora,
      notas: notas || '',
      solicitadoPor: `${user.name} ${user.lastName}`,
      emailSolicitante: user.email,
      telefonoSolicitante: user.phone
    };

    // Enviar notificación por email al centro quiropráctico
    const notificationResult = await sendAppointmentRequest(appointmentRequest);

    if (notificationResult.success) {
      res.status(200).json({ 
        message: 'Solicitud de cita enviada exitosamente. Nos pondremos en contacto contigo pronto.',
        solicitud: appointmentRequest
      });
    } else {
      console.error('Error al enviar solicitud:', notificationResult.error);
      res.status(500).json({ 
        error: 'Error al enviar la solicitud. Intenta nuevamente o contacta por WhatsApp.' 
      });
    }

  } catch (error) {
    console.error('Error al procesar solicitud de cita:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  sendAppointmentReminderManual,
  requestAppointment
}; 