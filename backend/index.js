import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './presentation/routes.js';
import { sequelize, Users } from './database/connection.database.js';
import specs from './config/swagger.js';

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000';
    const allowed = allowedOrigins.split(',');
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Centro Quiropráctico"
}));

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
  console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
});
