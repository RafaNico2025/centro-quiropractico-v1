import ExcelJS from 'exceljs';
import { Appointment, Income, Patient } from '../models/index.js';
import { Op } from 'sequelize';

export const generateAppointmentsReport = async (startDate, endDate) => {
  const appointments = await Appointment.findAll({
    where: {
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    },
    include: [Patient]
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Turnos');

  // Establecer columnas
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Paciente', key: 'patientName', width: 30 },
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Hora Inicio', key: 'startTime', width: 15 },
    { header: 'Hora Fin', key: 'endTime', width: 15 },
    { header: 'Estado', key: 'status', width: 15 },
    { header: 'Motivo', key: 'reason', width: 30 }
  ];

  // Agregar datos
  appointments.forEach(appointment => {
    worksheet.addRow({
      id: appointment.id,
      patientName: appointment.Patient.name,
      date: appointment.date.toLocaleDateString(),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      reason: appointment.reason
    });
  });

  return workbook;
};

export const generateIncomeReport = async (startDate, endDate) => {
  const incomes = await Income.findAll({
    where: {
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    },
    include: [Patient]
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ingresos');

  // Establecer columnas
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Monto', key: 'amount', width: 15 },
    { header: 'Descripción', key: 'description', width: 30 },
    { header: 'Método de Pago', key: 'paymentMethod', width: 20 },
    { header: 'Categoría', key: 'category', width: 20 },
    { header: 'Paciente', key: 'patientName', width: 30 }
  ];

  // Agregar datos
  incomes.forEach(income => {
    worksheet.addRow({
      id: income.id,
      date: income.date.toLocaleDateString(),
      amount: income.amount,
      description: income.description,
      paymentMethod: income.paymentMethod,
      category: income.category,
      patientName: income.Patient ? income.Patient.name : 'N/A'
    });
  });

  return workbook;
};

export const generateStatisticsReport = async (startDate, endDate) => {
  const appointments = await Appointment.findAll({
    where: {
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }
  });

  const statistics = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no_show').length
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estadísticas');

  // Agregar estadísticas
  worksheet.addRow(['Métrica', 'Cantidad', 'Porcentaje']);
  worksheet.addRow(['Total Turnos', statistics.total, '100%']);
  worksheet.addRow(['Completados', statistics.completed, `${(statistics.completed / statistics.total * 100).toFixed(2)}%`]);
  worksheet.addRow(['Cancelados', statistics.cancelled, `${(statistics.cancelled / statistics.total * 100).toFixed(2)}%`]);
  worksheet.addRow(['No Asistieron', statistics.noShow, `${(statistics.noShow / statistics.total * 100).toFixed(2)}%`]);

  return workbook;
}; 