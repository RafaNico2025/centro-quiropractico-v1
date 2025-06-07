import { Appointments, Patients, Users, Incomes } from '../../database/connection.database.js';
import { Op, fn, col, literal } from 'sequelize';
import ExcelJS from 'exceljs';

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

/**
 * @swagger
 * /stats/export:
 *   get:
 *     summary: Exportar estadísticas a Excel
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
 *     responses:
 *       200:
 *         description: Archivo Excel con estadísticas
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
const exportStatsToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validar y formatear fechas
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Gonzalo Cajeao Quiropraxia';
    workbook.created = new Date();
    
    // 1. Hoja de Resumen Ejecutivo
    const summarySheet = workbook.addWorksheet('Resumen Ejecutivo');
    const stats = await getGeneralStatsData(defaultStartDate, defaultEndDate);

    // Definir whereAppointments para la consulta de pacientes frecuentes
    const whereAppointments = {
      date: {
        [Op.between]: [
          defaultStartDate,
          defaultEndDate
        ]
      }
    };
    
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 15 }
    ];
    
    summarySheet.addRows([
      { metric: 'Período del Reporte', value: `${stats.periodo.inicio} a ${stats.periodo.fin}` },
      { metric: 'Total de Citas', value: stats.citas.total },
      { metric: 'Tasa de Asistencia', value: `${stats.citas.tasaAsistencia}%` },
      { metric: 'Tasa de Cancelación', value: `${stats.citas.tasaCancelacion}%` },
      { metric: 'Total de Pacientes', value: stats.pacientes.total },
      { metric: 'Pacientes Nuevos en el Período', value: stats.pacientes.nuevos },
      { metric: 'Ingresos Totales', value: `$${stats.finanzas.ingresosTotales}` },
      { metric: 'Promedio de Ingreso por Cita', value: `$${stats.finanzas.promedioPorCita}` }
    ]);

    // 2. Hoja de Detalle de Citas
    const appointmentsSheet = workbook.addWorksheet('Detalle de Citas');
    appointmentsSheet.columns = [
      { header: 'Tipo', key: 'type', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 15 },
      { header: 'Porcentaje', key: 'percentage', width: 15 }
    ];

    appointmentsSheet.addRows([
      { 
        type: 'Completadas', 
        quantity: stats.citas.completadas,
        percentage: `${(stats.citas.completadas / stats.citas.total * 100).toFixed(2)}%`
      },
      { 
        type: 'Canceladas', 
        quantity: stats.citas.canceladas,
        percentage: `${(stats.citas.canceladas / stats.citas.total * 100).toFixed(2)}%`
      },
      { 
        type: 'No Asistieron', 
        quantity: stats.citas.noAsistio,
        percentage: `${(stats.citas.noAsistio / stats.citas.total * 100).toFixed(2)}%`
      },
      { 
        type: 'Programadas', 
        quantity: stats.citas.programadas,
        percentage: `${(stats.citas.programadas / stats.citas.total * 100).toFixed(2)}%`
      }
    ]);

    // 3. Hoja de Tendencias Diarias
    const trendsSheet = workbook.addWorksheet('Tendencias Diarias');
    trendsSheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Total Citas', key: 'total', width: 12 },
      { header: 'Completadas', key: 'completadas', width: 12 },
      { header: 'Canceladas', key: 'canceladas', width: 12 },
      { header: 'No Asistieron', key: 'noAsistio', width: 12 },
      { header: 'Tasa de Asistencia', key: 'attendanceRate', width: 18 }
    ];
    
    trendsSheet.addRows(stats.tendencia.map(day => ({
      date: day.date,
      total: parseInt(day.total),
      completadas: parseInt(day.completadas),
      canceladas: parseInt(day.canceladas),
      noAsistio: parseInt(day.noAsistio),
      attendanceRate: `${((parseInt(day.completadas) / parseInt(day.total)) * 100).toFixed(2)}%`
    })));

    // 4. Hoja de Pacientes
    const patientsSheet = workbook.addWorksheet('Análisis de Pacientes');
    
    // Obtener pacientes más frecuentes usando una subconsulta
    const topPatients = await Patients.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        [
          literal(`(
            SELECT COUNT(*)
            FROM "Appointments" AS "Appointment"
            WHERE 
              "Appointment"."patientId" = "Patients"."id"
              AND "Appointment"."date" BETWEEN :startDate AND :endDate
              AND "Appointment"."deletedAt" IS NULL
          )`),
          'citasTotal'
        ]
      ],
      replacements: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      },
      where: {
        deletedAt: null
      },
      order: [[literal('("citasTotal")'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Asegurarse de que tenemos datos válidos
    const validTopPatients = topPatients.map(patient => ({
      ...patient,
      citasTotal: parseInt(patient.citasTotal) || 0
    })).sort((a, b) => b.citasTotal - a.citasTotal);

    patientsSheet.columns = [
      { header: 'Métrica de Pacientes', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 15 }
    ];

    patientsSheet.addRows([
      { metric: 'Total de Pacientes Registrados', value: stats.pacientes.total },
      { metric: 'Pacientes Nuevos en el Período', value: stats.pacientes.nuevos },
      { metric: 'Promedio de Citas por Paciente', value: (stats.citas.total / stats.pacientes.total).toFixed(2) }
    ]);

    // Agregar sección de pacientes más frecuentes
    patientsSheet.addRow({ metric: '', value: '' }); // Espacio en blanco
    patientsSheet.addRow({ metric: 'TOP 10 PACIENTES MÁS FRECUENTES', value: 'Cantidad de Citas' });
    validTopPatients.forEach(patient => {
      patientsSheet.addRow({
        metric: `${patient.firstName} ${patient.lastName}`,
        value: patient.citasTotal
      });
    });

    // 5. Hoja de Finanzas
    const financesSheet = workbook.addWorksheet('Análisis Financiero');
    financesSheet.columns = [
      { header: 'Métrica Financiera', key: 'metric', width: 35 },
      { header: 'Valor', key: 'value', width: 15 }
    ];

    // Calcular métricas financieras adicionales
    const ingresosPorDia = stats.finanzas.ingresosTotales / stats.tendencia.length;
    const ingresosPromedioMensual = stats.finanzas.ingresosTotales * (30 / stats.tendencia.length);

    financesSheet.addRows([
      { metric: 'Ingresos Totales del Período', value: `$${stats.finanzas.ingresosTotales}` },
      { metric: 'Promedio de Ingreso por Cita', value: `$${stats.finanzas.promedioPorCita}` },
      { metric: 'Promedio de Ingresos Diarios', value: `$${Math.round(ingresosPorDia)}` },
      { metric: 'Proyección de Ingresos Mensuales', value: `$${Math.round(ingresosPromedioMensual)}` },
      { metric: 'Tasa de Conversión (Citas Completadas)', value: `${stats.citas.tasaAsistencia}%` }
    ]);

    // Aplicar estilos a todas las hojas
    [summarySheet, appointmentsSheet, trendsSheet, patientsSheet, financesSheet].forEach(sheet => {
      // Estilo para encabezados
      sheet.getRow(1).font = { bold: true, size: 12 };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Bordes para todas las celdas con datos
      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Alinear números a la derecha
      sheet.columns.forEach(column => {
        if (column.key !== 'metric' && column.key !== 'type' && column.key !== 'date') {
          column.alignment = { horizontal: 'right' };
        }
      });
    });
    
    // Enviar el archivo
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=estadisticas_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    try {
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al escribir el archivo Excel:', error);
      res.status(500).json({
        message: 'Error al generar el archivo Excel',
        error: error.message
      });
    }
    
  } catch (error) {
    console.error('Error al exportar estadísticas:', error);
    res.status(500).json({
      message: 'Error al exportar estadísticas',
      error: error.message
    });
  }
};

// Función auxiliar para obtener los datos de estadísticas generales
const getGeneralStatsData = async (startDate, endDate) => {
  const now = new Date();
  const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]; // 3 meses atrás por defecto
  const defaultEndDate = endDate || new Date().toISOString().split('T')[0]; // Hoy por defecto

  const whereAppointments = {
    date: {
      [Op.between]: [defaultStartDate, defaultEndDate]
    },
    deletedAt: null
  };

  // Obtener todas las estadísticas necesarias
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

  // Pacientes totales y nuevos en el período
  const totalPacientes = await Patients.count({
    where: {
      deletedAt: null
    }
  });

  const nuevosPacientes = await Patients.count({
    where: {
      createdAt: {
        [Op.between]: [defaultStartDate + ' 00:00:00', defaultEndDate + ' 23:59:59']
      },
      deletedAt: null
    }
  });

  // Ingresos en el período
  let ingresosTotales = 0;
  try {
    const ingresos = await Incomes.sum('amount', {
      where: {
        date: {
          [Op.between]: [defaultStartDate, defaultEndDate]
        },
        deletedAt: null
      }
    });
    ingresosTotales = ingresos || 0;
  } catch (error) {
    console.log('Tabla de ingresos no disponible');
  }

  // Tendencias diarias
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

  return {
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
  };
};

export {
  getGeneralStats,
  getAppointmentStats,
  getPatientStats,
  exportStatsToExcel
};
