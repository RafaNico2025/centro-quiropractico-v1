import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users, Patients } from '../../database/connection.database.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - name
 *         - lastName
 *         - email
 *         - phone
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *         role:
 *           type: string
 *           enum: [admin, user, staff]
 *           default: user
 *           description: Rol del usuario
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
const register = async (req, res) => {
  try {
    const { username, password, name, lastName, phone, email, role, dni } = req.body;

    // Validaciones simples
    if (!username || !password || !email || !dni) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Chequear si ya existe el usuario
    const existeUsuario = await Users.findOne({ where: { username } });
    if (existeUsuario) return res.status(400).json({ message: 'El usuario ya existe' });

    // Verificar si ya existe un paciente con ese DNI
    const pacienteExistente = await Patients.findOne({ where: { dni } });
    
    // Si el paciente existe y ya tiene cuenta de usuario
    if (pacienteExistente && pacienteExistente.hasUserAccount) {
      return res.status(400).json({ message: 'Ya existe un usuario registrado con ese DNI' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Users.create({
      username,
      password: hashedPassword,
      name,
      lastName,
      phone,
      email,
      role: role || 'patient'
    });

    // Si el usuario es un paciente
    if (role === 'patient' || !role) {
      try {
        if (pacienteExistente) {
          // Si el paciente ya existe, actualizamos sus datos y marcamos que tiene cuenta
          await pacienteExistente.update({
            firstName: name,
            lastName: lastName,
            phone: phone,
            email: email,
            hasUserAccount: true
          });
        } else {
          // Si no existe, creamos un nuevo paciente
          await Patients.create({
            firstName: name,
            lastName: lastName,
            dni: dni,
            phone: phone,
            email: email,
            hasUserAccount: true
          });
        }
      } catch (error) {
        console.error('Error al crear/actualizar paciente:', error);
        // No retornamos error aquí para no afectar el registro del usuario
      }
    }

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: nuevoUsuario,
      isExistingPatient: !!pacienteExistente
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuario = await Users.findOne({ where: { username } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        name: usuario.name,
        lastName: usuario.lastName,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export { register, login };
