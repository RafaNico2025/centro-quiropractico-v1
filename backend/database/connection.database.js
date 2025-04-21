import { Sequelize } from 'sequelize';
import 'dotenv/config';
import User from '../models/User.js';

const sequelize = new Sequelize(process.env.SUPABASE_DB, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Supabase necesita esto
    }
  }
});

// Definir el modelo
const Usuarios = User(sequelize);

// Sincronizar el modelo con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados con la base de datos');
  })
  .catch((error) => {
    console.error('Error al sincronizar modelos:', error);
  });

export { sequelize, Usuarios };
