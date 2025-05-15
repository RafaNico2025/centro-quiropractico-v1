import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.database.js';

const Appointment = (sequelize) =>
  sequelize.define('Appointments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'),
      defaultValue: 'scheduled'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatmentDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id'
      }
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderSent24h: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderSent1h: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    patientConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rescheduledFrom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Appointments',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeCreate: (appointment) => {
        appointment.createdAt = new Date();
        appointment.updatedAt = new Date();
      },
      beforeUpdate: (appointment) => {
        appointment.updatedAt = new Date();
      }
    }
  });

export default Appointment; 