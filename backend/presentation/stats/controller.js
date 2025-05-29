import { Appointments, Patients, Users, Incomes } from '../../database/connection.database.js';
import { Op, fn, col, literal } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     Stats:
 *       type: object
 *       properties:
 *         totalCitas:
 *           type: integer
 *         citasCompletadas:
 *           type: integer
 *         citasCanceladas:
 *           type: integer
 *         citasNoAsistio:
 *           type: integer
 *         tasaAsistencia:
 *           type: number
 *         totalPacientes:
 *           type: integer
 *         nuevosPacientes:
 *           type: integer
 *         ingresosTotales:
 *           type: number
 */

/**
 * @swagger
 * /stats/general:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para el período
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para el período
 *     responses:
 *       200:
 *         description: Estadísticas generales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 */
const getGeneralStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Si no se especifica período, usar el mes actual
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Estadísticas de citas
    const whereAppointments = {
      date: {
        [Op.between]: [defaultStartDate, defaultEndDate]
      }
    };

    const totalCitas = await Appointments.count({ where: whereAppointments });
    const citasCompletadas = await Appointments.count({ 
      where: { ...whereAppointments, status: 'completed' } 
    });
    const citasCanceladas = await Appointments.count({ 
      where: { ...whereAppointments, status: 'cancelled' } 
    });
    const citasNoAsistio = await Appointments.count({ 
      where: { ...whereAppointments, status: 'no_show' } 
    });
    const citasProgramadas = await Appointments.count({ 
      where: { ...whereAppointments, status: 'scheduled' } 
    });

    const tasaAsistencia = totalCitas > 0 ? 
      Math.round((citasCompletadas / totalCitas) * 100) : 0;

    // Estadísticas de pacientes
    const totalPacientes = await Patients.count();
    const nuevosPacientes = await Patients.count({
      where: {
        createdAt: {
          [Op.between]: [defaultStartDate + ' 00:00:00', defaultEndDate + ' 23:59:59']
        }
      }
    });

    // Estadísticas financieras (si existe la tabla de ingresos)
    let ingresosTotales = 0;
    try {
      const ingresos = await Incomes.sum('amount', {
        where: {
          date: {
            [Op.between]: [defaultStartDate, defaultEndDate]
          }
        }
      });
      ingresosTotales = ingresos || 0;
    } catch (error) {
      // Si no existe la tabla de ingresos, mantener en 0
      console.log('Tabla de ingresos no disponible');
    }

    // Estadísticas por día del período
    const appointmentsByDay = await Appointments.findAll({
      where: whereAppointments,
      attributes: [
        'date',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), 'completadas'],
        [fn('SUM', literal("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END")), 'canceladas'],
        [fn('SUM', literal("CASE WHEN status = 'no_show' THEN 1 ELSE 0 END")), 'noAsistio']
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true
    });

    res.json({
      periodo: {
        inicio: defaultStartDate,
        fin: defaultEndDate
      },
      citas: {
        total: totalCitas,
        completadas: citasCompletadas,
        canceladas: citasCanceladas,
        noAsistio: citasNoAsistio,
        programadas: citasProgramadas,
        tasaAsistencia: tasaAsistencia,
        tasaCancelacion: totalCitas > 0 ? Math.round(((citasCanceladas + citasNoAsistio) / totalCitas) * 100) : 0
      },
      pacientes: {
        total: totalPacientes,
        nuevos: nuevosPacientes
      },
      finanzas: {
        ingresosTotales: ingresosTotales,
        promedioPorCita: citasCompletadas > 0 ? Math.round(ingresosTotales / citasCompletadas) : 0
      },
      tendencia: appointmentsByDay
    });

  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /stats/appointments:
 *   get:
 *     summary: Obtener estadísticas detalladas de citas
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: integer
 *         description: ID del profesional para filtrar
 *     responses:
 *       200:
 *         description: Estadísticas de citas
 */
const getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate, professionalId } = req.query;
    const where = {};

    // Aplicar filtros de fecha
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      // Por defecto, últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      where.date = {
        [Op.gte]: sixMonthsAgo.toISOString().split('T')[0]
      };
    }

    // Filtrar por profesional si se especifica
    if (professionalId) {
      where.professionalId = professionalId;
    }

    // Estadísticas por mes (PostgreSQL)
    const monthlyStats = await Appointments.findAll({
      where,
      attributes: [
        [fn('TO_CHAR', col('date'), 'YYYY-MM'), 'mes'],
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), 'completadas'],
        [fn('SUM', literal("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END")), 'canceladas'],
        [fn('SUM', literal("CASE WHEN status = 'no_show' THEN 1 ELSE 0 END")), 'noAsistio'],
        [fn('SUM', literal("CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END")), 'programadas']
      ],
      group: [fn('TO_CHAR', col('date'), 'YYYY-MM')],
      order: [[fn('TO_CHAR', col('date'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    // Estadísticas por día de la semana (PostgreSQL)
    const weekdayStats = await Appointments.findAll({
      where,
      attributes: [
        [literal('EXTRACT(dow FROM "date")'), 'diaSemana'],
        [fn('COUNT', col('id')), 'total']
      ],
      group: [literal('EXTRACT(dow FROM "date")')],
      raw: true
    });

    // Mapear días de la semana (PostgreSQL usa 0=domingo)
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const statsWeekday = weekdayStats.map(stat => ({
      dia: diasSemana[parseInt(stat.diaSemana)],
      total: parseInt(stat.total)
    }));

    res.json({
      porMes: monthlyStats,
      porDiaSemana: statsWeekday
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de citas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de citas',
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /stats/patients:
 *   get:
 *     summary: Obtener estadísticas de pacientes
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de pacientes
 */
const getPatientStats = async (req, res) => {
  try {
    const totalPacientes = await Patients.count();
    
    // Pacientes por mes (últimos 12 meses) - PostgreSQL
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const pacientesPorMes = await Patients.findAll({
      where: {
        createdAt: {
          [Op.gte]: oneYearAgo
        }
      },
      attributes: [
        [fn('TO_CHAR', col('createdAt'), 'YYYY-MM'), 'mes'],
        [fn('COUNT', col('id')), 'nuevos']
      ],
      group: [fn('TO_CHAR', col('createdAt'), 'YYYY-MM')],
      order: [[fn('TO_CHAR', col('createdAt'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    // Pacientes más activos - método simplificado
    let pacientesActivos = [];
    try {
      // Usar consulta SQL directa
      const query = `
        SELECT 
          p.id,
          p."firstName",
          p."lastName",
          COUNT(a.id)::integer as "totalCitas"
        FROM "Patients" p
        LEFT JOIN "Appointments" a ON p.id = a."patientId" AND a."deletedAt" IS NULL
        WHERE p."deletedAt" IS NULL
        GROUP BY p.id, p."firstName", p."lastName"
        HAVING COUNT(a.id) > 0
        ORDER BY COUNT(a.id) DESC
        LIMIT 10
      `;

      pacientesActivos = await Patients.sequelize.query(query, {
        type: 'SELECT'
      });
    } catch (error) {
      console.log('Error en consulta de pacientes activos:', error.message);
      // Fallback: devolver array vacío
      pacientesActivos = [];
    }

    res.json({
      total: totalPacientes,
      nuevosPorMes: pacientesPorMes,
      masActivos: pacientesActivos
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de pacientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de pacientes',
      error: error.message 
    });
  }
};

export {
  getGeneralStats,
  getAppointmentStats,
  getPatientStats
};
