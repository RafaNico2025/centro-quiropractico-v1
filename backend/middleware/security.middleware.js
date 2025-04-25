import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
};

export const encryptData = (data) => {
  // Implementar encriptación de datos sensibles
  // Por ejemplo, usando crypto-js o bcrypt
  return data; // Placeholder
};

export const validateAppointment = async (req, res, next) => {
  try {
    const { date, startTime, endTime, professionalId } = req.body;

    // Verificar si hay turnos superpuestos
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        date,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          }
        ]
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Ya existe un turno en ese horario' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 