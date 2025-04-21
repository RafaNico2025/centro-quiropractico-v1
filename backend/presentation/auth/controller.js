import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuarios } from '../../database/connection.database.js';

const register = async (req, res) => {
  try {
    const { Username, Password, Nombre, Apellido, Telefono, Email } = req.body;

    // Validaciones simples
    if (!Username || !Password || !Email) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Chequear si ya existe
    const existe = await Usuarios.findOne({ where: { Username } });
    if (existe) return res.status(400).json({ message: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(Password, 10);

    const nuevoUsuario = await Usuarios.create({
      Username,
      Password: hashedPassword,
      Nombre,
      Apellido,
      Telefono,
      Email,
    });

    res.status(201).json({ message: 'Usuario registrado', user: nuevoUsuario });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { Username, Password } = req.body;

    const usuario = await Usuarios.findOne({ where: { Username } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const passwordOk = await bcrypt.compare(Password, usuario.Password);
    if (!passwordOk) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.Id, username: usuario.Username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    usuario.LastLogin = new Date();
    usuario.SessionToken = token;
    await usuario.save();

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export default {
  register,
  login,
};
