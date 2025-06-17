import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users, Patients } from '../../database/connection.database.js';
import userController from '../user/controller.js';

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
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        message: 'Por favor complete todos los campos: nombre de usuario, contraseña, email y DNI' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido',
        message: 'Por favor ingrese un email válido' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Chequear si ya existe el usuario por username
    const existeUsuario = await Users.findOne({ where: { username } });
    if (existeUsuario) {
      return res.status(400).json({ 
        error: 'Nombre de usuario no disponible',
        message: 'El nombre de usuario ya está en uso. Por favor elija otro.' 
      });
    }

    // Chequear si ya existe el usuario por email
    const existeEmail = await Users.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({ 
        error: 'Email ya registrado',
        message: 'Ya existe una cuenta registrada con este email. ¿Desea iniciar sesión?' 
      });
    }

    // Verificar si ya existe un paciente con ese DNI
    let pacienteExistente = await Patients.findOne({ where: { dni } });
    
    // Si el paciente existe y ya tiene cuenta de usuario
    if (pacienteExistente && pacienteExistente.hasUserAccount) {
      return res.status(400).json({ 
        error: 'DNI ya registrado',
        message: 'Ya existe un usuario registrado con este DNI. Si es su cuenta, inicie sesión.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario primero, sin patientId
    const nuevoUsuario = await Users.create({
      username,
      password: hashedPassword,
      name,
      lastName,
      phone,
      email,
      role: role || 'patient'
    });

    let pacienteFinal = pacienteExistente;

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
          pacienteFinal = await Patients.create({
            firstName: name,
            lastName: lastName,
            dni: dni,
            phone: phone,
            email: email,
            hasUserAccount: true
          });
        }
        // Si se creó un nuevo paciente, actualizar pacienteFinal
        if (!pacienteExistente) {
          pacienteExistente = pacienteFinal;
        }
        // Asignar el patientId al usuario
        await nuevoUsuario.update({ patientId: pacienteFinal.id });
      } catch (error) {
        console.error('Error al crear/actualizar paciente:', error);
        // Si hay error con el paciente, eliminamos el usuario creado
        await nuevoUsuario.destroy();
        return res.status(500).json({ 
          error: 'Error al crear perfil de paciente',
          message: 'No se pudo completar el registro. Inténtelo nuevamente.' 
        });
      }
    }

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: {
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
        name: nuevoUsuario.name,
        lastName: nuevoUsuario.lastName,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role
      },
      isExistingPatient: !!pacienteExistente
    });
  } catch (error) {
    console.error('Error en register:', error);
    
    // Manejar errores específicos de base de datos
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      let message = 'Ya existe un registro con esos datos';
      
      if (field === 'username') {
        message = 'El nombre de usuario ya está en uso';
      } else if (field === 'email') {
        message = 'Ya existe una cuenta con este email';
      } else if (field === 'dni') {
        message = 'Ya existe una cuenta con este DNI';
      }
      
      return res.status(400).json({ 
        error: 'Datos duplicados',
        message: message 
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo completar el registro. Inténtelo nuevamente más tarde.' 
    });
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
      { expiresIn: '24h' }
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

// Importar las funciones desde el controlador de usuarios
const { forgotPassword, resetPassword } = userController;

export { register, login, forgotPassword, resetPassword };
