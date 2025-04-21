import { DataTypes } from 'sequelize';

const Usuarios = (sequelize) =>
  sequelize.define('Usuarios', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Username: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Apellido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Telefono: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    LastLogin: {
      type: DataTypes.DATE,
    },
    Habilitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    SessionToken: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'Usuarios',
    timestamps: false,
  });

export default Usuarios;
