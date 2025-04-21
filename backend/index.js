import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/ejemplo.routes.js';



const app = express();

const corsOptions = {
  origin: ['http://localhost:3000','http://localhost:3001','http://localhost:5173', 'https://centroquirogc.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
