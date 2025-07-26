import { Appointments, Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';
import { sendAppointmentNotification, sendAppointmentCancellation, sendAppointmentReminder, sendAppointmentRequest, sendAppointmentRescheduled, sendAppointmentApproved, sendAppointmentRejected } from '../../services/notification.service.js';

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

    // Validar campos obligatorios
    if (!date || !startTime || !endTime || !patientId || !professionalId) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios',
        message: 'Por favor complete: fecha, hora de inicio, hora de fin, paciente y profesional'
      });
    }

    // Validar que la fecha no sea en el pasado - usando comparación de strings para evitar problemas de zona horaria
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Permitir la fecha de hoy y fechas futuras
    if (date < todayString) {
      return res.status(400).json({ 
        error: 'Fecha inválida',
        message: `No se pueden crear citas en fechas pasadas. Fecha recibida: ${date}, Fecha hoy: ${todayString}`
      });
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (startTime >= endTime) {
      return res.status(400).json({ 
        error: 'Horario inválido',
        message: 'La hora de fin debe ser posterior a la hora de inicio'
      });
    }

    // Verificar que el paciente existe
    const patient = await Patients.findByPk(patientId);
    if (!patient) {
      return res.status(400).json({ 
        error: 'Paciente no encontrado',
        message: 'El paciente seleccionado no existe en el sistema'
      });
    }

    // Verificar que el profesional existe
    const professional = await Users.findByPk(professionalId);
    if (!professional) {
      return res.status(400).json({ 
        error: 'Profesional no encontrado',
        message: 'El profesional seleccionado no existe en el sistema'
      });
    }

    // Verificar disponibilidad del horario
    const existingAppointment = await Appointments.findOne({
      where: {
        professionalId,
        date,
        status: {
          [Op.not]: 'cancelled' // Excluir citas canceladas
        },
        [Op.or]: [
          // Verificar si la nueva cita comienza ANTES de que termine una cita existente
          // Y termina DESPUÉS de que comience una cita existente
          // Esto permite que las citas sean consecutivas (una termine cuando otra comience)
          {
            [Op.and]: [
              { startTime: { [Op.lt]: endTime } },     // Cita existente comienza antes de que termine la nueva
              { endTime: { [Op.gt]: startTime } }      // Cita existente termina después de que comience la nueva
            ]
          }
        ]
      }
    });

    if (existingAppointment) {
      // Obtener información detallada de la cita existente para el mensaje de error
      const existingPatient = await Patients.findByPk(existingAppointment.patientId, {
        attributes: ['firstName', 'lastName']
      });
      
      return res.status(400).json({ 
        error: 'Horario no disponible',
        message: `Ya existe una cita programada que se superpone con el horario solicitado.\n` +
                `Cita existente: ${existingAppointment.startTime} - ${existingAppointment.endTime}\n` +
                `Paciente: ${existingPatient?.firstName} ${existingPatient?.lastName}\n` +
                `Horario solicitado: ${startTime} - ${endTime}\n\n` +
                `Sugerencia: Puedes agendar una cita que comience exactamente cuando termine otra (ej: si hay una cita hasta 14:45, puedes agendar desde 14:45).`
      });
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
    const [patientData, professionalData] = await Promise.all([
      Patients.findByPk(patientId, {
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
      }),
      Users.findByPk(professionalId, {
        attributes: ['id', 'name', 'lastName', 'email']
      })
    ]);

    // Enviar notificaciones con todos los datos
    const notificationResults = await sendAppointmentNotification(appointment, patientData, professionalData);
    
    // Actualizar el flag de notificación enviada
    await appointment.update({ 
      notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo crear la cita. Inténtelo nuevamente más tarde.' 
    });
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
    const { startDate, endDate, professionalId, patientId, status, includeCancelled } = req.query;
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
    } else if (!includeCancelled) {
      // Por defecto, excluir citas canceladas a menos que se especifique lo contrario
      where.status = {
        [Op.ne]: 'cancelled'
      };
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
          id: { [Op.ne]: id }, // Excluir la cita actual
          professionalId: newProfessionalId,
          date: newDate,
          status: {
            [Op.not]: 'cancelled' // Excluir citas canceladas
          },
          [Op.or]: [
            // Verificar si la cita actualizada se superpone con citas existentes
            // Permitir citas consecutivas (una termine cuando otra comience)
            {
              [Op.and]: [
                { startTime: { [Op.lt]: newEndTime } },     // Cita existente comienza antes de que termine la actualizada
                { endTime: { [Op.gt]: newStartTime } }      // Cita existente termina después de que comience la actualizada
              ]
            }
          ]
        }
      });

      if (existingAppointment) {
        // Obtener información detallada de la cita existente para el mensaje de error
        const existingPatient = await Patients.findByPk(existingAppointment.patientId, {
          attributes: ['firstName', 'lastName']
        });
        
        return res.status(400).json({ 
          error: 'Horario no disponible para la actualización',
          message: `Ya existe una cita programada que se superpone con el horario solicitado.\n` +
                  `Cita existente: ${existingAppointment.startTime} - ${existingAppointment.endTime}\n` +
                  `Paciente: ${existingPatient?.firstName} ${existingPatient?.lastName}\n` +
                  `Horario solicitado: ${newStartTime} - ${newEndTime}\n\n` +
                  `Sugerencia: Puedes reagendar para que comience exactamente cuando termine otra cita.`
        });
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

    // Recargar la cita para obtener los datos actualizados
    await appointment.reload();

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
          
          // Actualizar el flag de notificación enviada
          await appointment.update({ 
            notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
          });
        }
      } catch (notificationError) {
        console.error('❌ Error al enviar notificación de cancelación:', notificationError);
        // No fallar la actualización por errores en notificaciones
      }
    }

    // Enviar notificación de reagendado si el estado cambió a rescheduled o se modificaron fecha/hora
    const wasRescheduled = status === 'rescheduled' && previousStatus !== 'rescheduled';
    const wasTimeChanged = (date && date !== appointment.date) || 
                          (startTime && startTime !== appointment.startTime) || 
                          (endTime && endTime !== appointment.endTime);

    if (wasRescheduled || wasTimeChanged) {
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
          const notificationResults = await sendAppointmentRescheduled(
            appointment, 
            patient, 
            professional
          );
          
          // Actualizar el flag de notificación enviada
          await appointment.update({ 
            notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
          });
        }
      } catch (notificationError) {
        console.error('❌ Error al enviar notificación de reagendado:', notificationError);
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
    const { motivo, preferenciaDia, preferenciaHora, notas, fechaSeleccionada, horarioSeleccionado, horariosSeleccionados } = req.body;
    const userId = req.user.id;

    // Obtener datos del usuario que solicita la cita
    const user = await Users.findByPk(userId, {
      attributes: ['id', 'name', 'lastName', 'email', 'phone', 'patientId']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene un paciente asociado
    if (!user.patientId) {
      return res.status(400).json({ error: 'Usuario no tiene un perfil de paciente asociado' });
    }

    // Procesar múltiples horarios si están disponibles
    let horariosArray = [];
    if (horariosSeleccionados && Array.isArray(horariosSeleccionados)) {
      horariosArray = horariosSeleccionados;
    } else if (horarioSeleccionado) {
      // Si no hay array pero hay string, dividir por comas
      horariosArray = horarioSeleccionado.split(',').map(h => h.trim());
    }

    // Si hay horarios específicos seleccionados, crear solicitudes para cada uno
    if (fechaSeleccionada && horariosArray.length > 0) {
      const createdAppointments = [];
      
      for (let i = 0; i < horariosArray.length; i++) {
        const horario = horariosArray[i];
        
        let startTime, endTime;
        
        // Si el horario es un objeto con startTime y endTime
        if (typeof horario === 'object' && horario.startTime && horario.endTime) {
          startTime = horario.startTime;
          endTime = horario.endTime;
        } 
        // Si el horario es un string en formato "HH:MM - HH:MM"
        else if (typeof horario === 'string' && horario.includes(' - ')) {
          [startTime, endTime] = horario.split(' - ');
        }
        // Si no se puede procesar el horario, omitir
        else {
          console.error('Formato de horario no válido:', horario, typeof horario);
          continue;
        }
        
        // Crear la solicitud de cita en estado pending
        const appointment = await Appointments.create({
          date: fechaSeleccionada,
          startTime: startTime,
          endTime: endTime,
          status: 'pending',
          requestStatus: 'pending',
          reason: motivo,
          notes: notas,
          patientId: user.patientId,
          professionalId: 1, // Por defecto, se puede cambiar después
          priority: 'medium',
          notificationSent: false,
          createdBy: userId // Agregar el campo requerido
        });
        
        createdAppointments.push(appointment);
      }

      // Enviar notificación al centro sobre las nuevas solicitudes
      const appointmentRequest = {
        motivo,
        preferenciaDia: fechaSeleccionada,
        preferenciaHora: horarioSeleccionado,
        notas: notas || '',
        fechaSeleccionada,
        horarioSeleccionado,
        horariosSeleccionados: horariosArray,
        cantidadHorarios: horariosArray.length,
        solicitadoPor: `${user.name} ${user.lastName}`,
        emailSolicitante: user.email,
        telefonoSolicitante: user.phone,
        tipoSolicitud: 'horarios_especificos'
      };

      const notificationResult = await sendAppointmentRequest(appointmentRequest);

      return res.status(201).json({
        success: true,
        message: `Solicitud${createdAppointments.length > 1 ? 'es' : ''} enviada${createdAppointments.length > 1 ? 's' : ''} exitosamente. ${createdAppointments.length} horario${createdAppointments.length > 1 ? 's' : ''} solicitado${createdAppointments.length > 1 ? 's' : ''}.`,
        appointments: createdAppointments,
        notificationResult
      });
    } else {
      // Si no hay horarios específicos, solo enviar el email de solicitud general
      const appointmentRequest = {
        motivo,
        preferenciaDia: preferenciaDia,
        preferenciaHora: preferenciaHora,
        notas: notas || '',
        solicitadoPor: `${user.name} ${user.lastName}`,
        emailSolicitante: user.email,
        telefonoSolicitante: user.phone,
        tipoSolicitud: 'preferencia_general'
      };

      // Enviar notificación por email al centro quiropráctico
      const notificationResult = await sendAppointmentRequest(appointmentRequest);

      return res.status(200).json({
        success: true,
        message: 'Solicitud de cita enviada exitosamente. Nos pondremos en contacto contigo pronto.',
        notificationResult
      });
    }

  } catch (error) {
    console.error('Error al procesar solicitud de cita:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la solicitud de cita',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /appointments/available-slots:
 *   get:
 *     summary: Obtener slots de tiempo disponibles para reservar citas
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para consultar disponibilidad (formato YYYY-MM-DD)
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: integer
 *         description: ID del profesional (opcional, si no se especifica muestra todos)
 *     responses:
 *       200:
 *         description: Lista de slots disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   startTime:
 *                     type: string
 *                     format: time
 *                   endTime:
 *                     type: string
 *                     format: time
 *                   available:
 *                     type: boolean
 *                   professionalId:
 *                     type: integer
 *                   professionalName:
 *                     type: string
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { date, professionalId } = req.query;
    
    // Si no se proporciona fecha, usar la fecha actual
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Validar que la fecha no sea en el pasado - usando comparación de strings para evitar problemas de zona horaria
    const todayString = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Permitir la fecha de hoy y fechas futuras
    if (targetDate < todayString) {
      return res.status(400).json({ 
        error: 'Fecha inválida',
        message: 'No se pueden consultar slots en fechas pasadas'
      });
    }

    // Obtener profesionales disponibles
    let professionals = [];
    try {
      if (professionalId) {
        const professional = await Users.findByPk(professionalId, {
          attributes: ['id', 'name', 'lastName'],
          where: { isActive: true }
        });
        if (professional) {
          professionals = [professional];
        } else {
          return res.status(404).json({ 
            error: 'Profesional no encontrado',
            message: 'El profesional especificado no existe o no está activo'
          });
        }
      } else {
        // Obtener todos los profesionales (usuarios con rol admin o staff)
        professionals = await Users.findAll({
          where: {
            role: ['admin', 'staff'],
            isActive: true
          },
          attributes: ['id', 'name', 'lastName']
        });
      }
    } catch (dbError) {
      console.error('❌ Error en consulta de profesionales:', dbError);
      return res.status(500).json({ 
        error: 'Error de base de datos',
        message: 'No se pudieron obtener los profesionales'
      });
    }

    if (professionals.length === 0) {
      return res.status(404).json({ 
        error: 'No hay profesionales disponibles',
        message: 'No se encontraron profesionales activos en el sistema'
      });
    }

    // Horario de atención (7:00 AM a 8:00 PM)
    const workingHours = {
      start: '07:00',
      end: '20:00'
    };

    // Generar slots de 15 minutos - versión simplificada
    const timeSlots = [];
    const startHour = 7;
    const endHour = 20;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 15;
        const endTimeHour = endMinute >= 60 ? hour + 1 : hour;
        const endTimeMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
        
        if (endTimeHour <= endHour) {
          timeSlots.push({
            startTime,
            endTime
          });
        }
      }
    }
    
    if (timeSlots.length === 0) {
      return res.status(500).json({ 
        error: 'Error generando horarios',
        message: 'No se pudieron generar los slots de tiempo'
      });
    }

    const availableSlots = [];

    // Para cada profesional, verificar disponibilidad
    for (const professional of professionals) {
      
      try {
        // Obtener citas existentes para este profesional en la fecha seleccionada
        const existingAppointments = await Appointments.findAll({
          where: {
            professionalId: professional.id,
            date: targetDate,
            status: {
              [Op.not]: 'cancelled' // Solo excluir citas canceladas, incluir rescheduled
            }
          },
          attributes: ['startTime', 'endTime', 'status'] // Agregar status para debug
        });

        // Verificar cada slot
        for (const slot of timeSlots) {
          const conflictingAppointments = existingAppointments.filter(appointment => {
            // Verificar si hay conflicto con citas existentes
            // Un slot está ocupado si se superpone con una cita existente
            // Pero permitimos que las citas sean consecutivas (una termine cuando otra comience)
            // Convertir a minutos para comparación más precisa
            const slotStartMinutes = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
            const slotEndMinutes = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);
            const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
            const appointmentEndMinutes = parseInt(appointment.endTime.split(':')[0]) * 60 + parseInt(appointment.endTime.split(':')[1]);
            
            // Hay conflicto si el slot se superpone con la cita
            // Pero permitimos que sean consecutivos (slotStart >= appointmentEnd o slotEnd <= appointmentStart)
            return !(slotStartMinutes >= appointmentEndMinutes || slotEndMinutes <= appointmentStartMinutes);
          });
          
          const isAvailable = conflictingAppointments.length === 0;

          availableSlots.push({
            date: targetDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            available: isAvailable,
            professionalId: professional.id,
            professionalName: `${professional.name} ${professional.lastName}`
          });
        }
      } catch (apptError) {
        console.error(`❌ Error consultando citas para profesional ${professional.id}:`, apptError);
        // Continuar con el siguiente profesional
        continue;
      }
    }

    // Filtrar solo los slots disponibles y ordenar por hora
    const onlyAvailableSlots = availableSlots
      .filter(slot => slot.available)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    res.json({
      date: targetDate,
      slots: onlyAvailableSlots,
      totalAvailable: onlyAvailableSlots.length,
      totalProfessionals: professionals.length,
      totalSlots: availableSlots.length
    });

  } catch (error) {
    console.error('❌ Error al obtener slots disponibles:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los horarios disponibles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /appointments/pending:
 *   get:
 *     summary: Obtener todas las solicitudes de citas pendientes
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes
 *       500:
 *         description: Error del servidor
 */
const getPendingAppointments = async (req, res) => {
  try {
    const pendingAppointments = await Appointments.findAll({
      where: {
        status: 'pending'
      },
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
          required: false
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(pendingAppointments);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener las solicitudes pendientes',
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /appointments/{id}/approve:
 *   put:
 *     summary: Aprobar una solicitud de cita
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Nueva fecha propuesta (opcional)
 *               startTime:
 *                 type: string
 *                 description: Nueva hora de inicio propuesta (opcional)
 *               endTime:
 *                 type: string
 *                 description: Nueva hora de fin propuesta (opcional)
 *               professionalId:
 *                 type: integer
 *                 description: ID del profesional asignado
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Solicitud aprobada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, professionalId, notes } = req.body;
    const adminId = req.user.id;

    const appointment = await Appointments.findByPk(id, {
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'email', 'phone'] },
        { model: Users, as: 'professional', attributes: ['name', 'lastName'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Solicitud de cita no encontrada' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }

    // Actualizar la cita con la aprobación
    const updateData = {
      status: 'approved',
      requestStatus: 'approved',
      approvedBy: adminId,
      approvedAt: new Date()
    };

    // Si se proporcionan nuevos datos, actualizarlos
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (professionalId) updateData.professionalId = professionalId;
    if (notes) updateData.notes = notes;

    await appointment.update(updateData);

    // Eliminar otras solicitudes pendientes del mismo paciente para la misma fecha
    const otherPendingAppointments = await Appointments.findAll({
      where: {
        id: { [Op.not]: id }, // Excluir la cita actual
        patientId: appointment.patientId,
        date: appointment.date,
        status: 'pending'
      }
    });

    if (otherPendingAppointments.length > 0) {
      // Eliminar físicamente las otras solicitudes pendientes
      await Appointments.destroy({
        where: {
          id: { [Op.in]: otherPendingAppointments.map(appt => appt.id) }
        }
      });
      
      console.log(`🗑️ Eliminadas ${otherPendingAppointments.length} solicitudes alternativas para el paciente ${appointment.patientId} en la fecha ${appointment.date}`);
    }

    // Recargar con los datos actualizados
    await appointment.reload({
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'email', 'phone'] },
        { model: Users, as: 'professional', attributes: ['name', 'lastName'] }
      ]
    });

    // Enviar notificación al paciente
    const patient = appointment.Patient;
    const professional = appointment.professional;
    
    if (patient) {
      try {
        const notificationResults = await sendAppointmentApproved(appointment, patient, professional);
        
        // Actualizar el flag de notificación enviada
        await appointment.update({ 
          notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
        });
      } catch (notificationError) {
        console.error('Error al enviar notificación de aprobación:', notificationError);
      }
    }

    res.json({
      message: 'Solicitud aprobada exitosamente',
      appointment: appointment,
      eliminatedAlternatives: otherPendingAppointments.length
    });

  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ 
      message: 'Error al aprobar la solicitud',
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /appointments/{id}/reject:
 *   put:
 *     summary: Rechazar una solicitud de cita
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
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: Motivo del rechazo
 *               alternativeOptions:
 *                 type: string
 *                 description: Opciones alternativas sugeridas
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, alternativeOptions } = req.body;
    const adminId = req.user.id;

    const appointment = await Appointments.findByPk(id, {
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'email', 'phone'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Solicitud de cita no encontrada' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }

    // Actualizar la cita con el rechazo
    await appointment.update({
      status: 'rejected',
      requestStatus: 'rejected',
      rejectionReason: rejectionReason,
      approvedBy: adminId,
      approvedAt: new Date(),
      notes: alternativeOptions ? `${appointment.notes || ''}\n\nOpciones alternativas: ${alternativeOptions}` : appointment.notes
    });

    // Enviar notificación al paciente
    const patient = appointment.Patient;
    
    if (patient) {
      try {
        const notificationResults = await sendAppointmentRejected(appointment, patient, rejectionReason, alternativeOptions);
        
        // Actualizar el flag de notificación enviada
        await appointment.update({ 
          notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
        });
      } catch (notificationError) {
        console.error('Error al enviar notificación de rechazo:', notificationError);
      }
    }

    res.json({
      message: 'Solicitud rechazada exitosamente',
      appointment: appointment
    });

  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ 
      message: 'Error al rechazar la solicitud',
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /appointments/{id}/schedule:
 *   put:
 *     summary: Confirmar y agendar una cita aprobada
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
 *         description: Cita agendada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
const scheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointments.findByPk(id, {
      include: [
        { model: Patients, attributes: ['firstName', 'lastName', 'email', 'phone'] },
        { model: Users, as: 'professional', attributes: ['name', 'lastName'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({ message: 'Esta cita debe estar aprobada para poder ser agendada' });
    }

    // Verificar disponibilidad del horario
    const conflictingAppointment = await Appointments.findOne({
      where: {
        professionalId: appointment.professionalId,
        date: appointment.date,
        status: ['scheduled', 'approved'],
        id: { [Op.not]: appointment.id },
        [Op.or]: [
          {
            [Op.and]: [
              { startTime: { [Op.lt]: appointment.endTime } },
              { endTime: { [Op.gt]: appointment.startTime } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ 
        message: 'Conflicto de horario',
        error: 'Ya existe una cita en este horario'
      });
    }

    // Actualizar a scheduled
    await appointment.update({
      status: 'scheduled'
    });

    // Enviar notificación de confirmación
    const patient = appointment.Patient;
    const professional = appointment.professional;
    
    if (patient) {
      try {
        const notificationResults = await sendAppointmentNotification(appointment, patient, professional);
        
        // Actualizar el flag de notificación enviada
        await appointment.update({ 
          notificationSent: notificationResults.email?.success || notificationResults.whatsapp?.success 
        });
      } catch (notificationError) {
        console.error('Error al enviar notificación de confirmación:', notificationError);
      }
    }

    res.json({
      message: 'Cita agendada exitosamente',
      appointment: appointment
    });

  } catch (error) {
    console.error('Error al agendar cita:', error);
    res.status(500).json({ 
      message: 'Error al agendar la cita',
      error: error.message 
    });
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  sendAppointmentReminderManual,
  requestAppointment,
  getAvailableSlots,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  scheduleAppointment
}; 