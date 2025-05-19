import { DataTypes } from 'sequelize';

const Patient = (sequelize) =>
  sequelize.define('Patients', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hasUserAccount: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  },
  {
    timestamps: true,
    paranoid: true
  });

export default Patient; 