import { Sequelize } from 'sequelize';
import 'dotenv/config';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalHistory from '../models/MedicalHistory.js';
import Income from '../models/Income.js';

const sequelize = new Sequelize(process.env.SUPABASE_DB, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Supabase necesita esto
    }
  }
});

// Definir los modelos
const Users = User(sequelize);
const Patients = Patient;
const Appointments = Appointment;
const MedicalHistories = MedicalHistory;
const Incomes = Income;

// Definir las relaciones
Patients.hasMany(Appointments, { foreignKey: 'patientId' });
Appointments.belongsTo(Patients, { foreignKey: 'patientId' });

Users.hasMany(Appointments, { foreignKey: 'professionalId' });
Appointments.belongsTo(Users, { foreignKey: 'professionalId' });

Patients.hasMany(MedicalHistories, { foreignKey: 'patientId' });
MedicalHistories.belongsTo(Patients, { foreignKey: 'patientId' });

Appointments.hasOne(MedicalHistories, { foreignKey: 'appointmentId' });
MedicalHistories.belongsTo(Appointments, { foreignKey: 'appointmentId' });

Users.hasMany(MedicalHistories, { foreignKey: 'professionalId' });
MedicalHistories.belongsTo(Users, { foreignKey: 'professionalId' });

Patients.hasMany(Incomes, { foreignKey: 'patientId' });
Incomes.belongsTo(Patients, { foreignKey: 'patientId' });

Appointments.hasOne(Incomes, { foreignKey: 'appointmentId' });
Incomes.belongsTo(Appointments, { foreignKey: 'appointmentId' });

Users.hasMany(Incomes, { foreignKey: 'recordedBy' });
Incomes.belongsTo(Users, { foreignKey: 'recordedBy' });

// Sincronizar los modelos con la base de datos
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos');
  })
  .catch((error) => {
    console.error('Error al sincronizar modelos:', error);
  });

export { 
  sequelize, 
  Users, 
  Patients, 
  Appointments, 
  MedicalHistories, 
  Incomes 
};
