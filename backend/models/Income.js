import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.database.js';

const Income = (sequelize) =>
  sequelize.define('Incomes', {
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
      type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'transfer', 'check', 'other'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('consultation', 'treatment', 'product', 'other'),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'completed', 'cancelled'),
      defaultValue: 'completed'
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true
    },
    recurringEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeCreate: (income) => {
        income.createdAt = new Date();
        income.updatedAt = new Date();
        // Calcular el monto neto
        income.netAmount = income.amount - income.discountAmount;
      },
      beforeUpdate: (income) => {
        income.updatedAt = new Date();
        // Recalcular el monto neto si cambian amount o discountAmount
        if (income.changed('amount') || income.changed('discountAmount')) {
          income.netAmount = income.amount - income.discountAmount;
        }
      }
    }
  });

export default Income; 