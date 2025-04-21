import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './presentation/routes.js';
import { sequelize, Usuarios } from './database/connection.database.js';

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000','http://localhost:3001','http://localhost:5173', 'https://centroquirogc.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Verificar conexión a la base de datos
try {
  await sequelize.authenticate();
  console.log('✅ Conexión a la base de datos establecida correctamente');
} catch (error) {
  console.error('❌ Error al conectar con la base de datos:', error);
}

// Usar las rutas
app.use('/api/v1', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
