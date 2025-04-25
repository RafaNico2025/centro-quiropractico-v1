import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.database.js';

const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'transfer'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('consultation', 'treatment', 'other'),
    allowNull: false
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  paranoid: true
});

export default Income; 