import { DataTypes } from 'sequelize';

const MedicalHistory = (sequelize) =>
  sequelize.define('MedicalHistories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id'
      }
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Appointments',
        key: 'id'
      }
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    familyHistory: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    paranoid: true
  });

export default MedicalHistory; 