import { Users, Patients } from '../../database/connection.database.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { sendEmailNotification } from '../../services/notification.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - Username
 *         - Password
 *         - Nombre
 *         - Apellido
 *         - Email
 *       properties:
 *         Username:
 *           type: string
 *           description: Nombre de usuario único
 *           example: "testuser123"
 *         Password:
 *           type: string
 *           description: Contraseña del usuario
 *           example: "123456"
 *         Nombre:
 *           type: string
 *           description: Nombre del usuario
 *           example: "Juan"
 *         Apellido:
 *           type: string
 *           description: Apellido del usuario
 *           example: "Pérez"
 *         Telefono:
 *           type: string
 *           description: Teléfono del usuario
 *           example: "3513859697"
 *         Email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: "juan.perez@example.com"
 *         Role:
 *           type: string
 *           enum: [admin, patient, staff]
 *           default: patient
 *           description: Rol del usuario
 *           example: "patient"
 *       example:
 *         Username: "testuser123"
 *         Password: "123456"
 *         Nombre: "Juan"
 *         Apellido: "Pérez"
 *         Telefono: "3513859697"
 *         Email: "juan.perez@example.com"
 *         Role: "patient"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error del servidor
 */
const getUsers = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive ? {} : { isActive: true };

    const users = await Users.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['username', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: { exclude: ['Password'] },
      include: [
        {
          model: Patients,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'dni', 'birthDate', 'address', 'gender', 'emergencyContact', 'emergencyPhone'],
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la solicitud o usuario ya existe
 *       500:
 *         description: Error del servidor
 */
const createUser = async (req, res) => {
  try {
    const { Username, Password, Nombre, Apellido, Telefono, Email, Role } = req.body;

    // Validaciones básicas
    if (!Username || !Password || !Email) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe (usando el nombre correcto de columna)
    const existingUser = await Users.findOne({ where: { username: Username } });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = await Users.create({
      username: Username,
      password: hashedPassword,
      name: Nombre,
      lastName: Apellido,
      phone: Telefono,
      email: Email,
      role: Role || 'patient' // Rol por defecto según el modelo
    });

    // Excluir la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { Username, Password, Nombre, Apellido, Telefono, Email, Role } = req.body;

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se cambia el username, verificar que no exista
    if (Username && Username !== user.username) {
      const existingUser = await Users.findOne({ where: { username: Username } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
      }
    }

    // Si se cambia la contraseña, encriptarla
    let hashedPassword = user.password;
    if (Password) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    await user.update({
      username: Username || user.username,
      password: hashedPassword,
      name: Nombre || user.name,
      lastName: Apellido || user.lastName,
      phone: Telefono || user.phone,
      email: Email || user.email,
      role: Role || user.role
    });

    // Excluir la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si el usuario es un paciente, actualizar también el estado en la tabla Patients
    if (user.role === 'patient') {
      const patient = await Patients.findOne({
        where: {
          [Op.or]: [
            { email: user.email },
            { dni: user.username }
          ]
        }
      });

      if (patient) {
        // En lugar de eliminar, marcamos como inactivo
        await patient.update({ isActive: false });
      }
    }

    // En lugar de eliminar el usuario, lo marcamos como inactivo
    await user.update({ isActive: false });

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error al desactivar el usuario' });
  }
};

/**
 * @swagger
 * /users/{id}/change-password:
 *   put:
 *     summary: Cambiar contraseña de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar y guardar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
};

/**
 * @swagger
 * /users/professionals:
 *   get:
 *     summary: Obtener lista de profesionales
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesionales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
const getProfessionals = async (req, res) => {
  try {
    const professionals = await Users.findAll({
      where: {
        role: {
          [Op.in]: ['staff', 'admin']
        },
        isActive: true
      },
      attributes: ['id', 'name', 'lastName', 'email', 'role', 'phone']
    })

    res.json(professionals)
  } catch (error) {
    console.error('Error al obtener profesionales:', error)
    res.status(500).json({ message: 'Error al obtener los profesionales' })
  }
}

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener lista de pacientes
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar pacientes
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
const getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { dni: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const patients = await Patients.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    })

    res.json(patients)
  } catch (error) {
    console.error('Error al obtener pacientes:', error)
    res.status(500).json({ message: 'Error al obtener los pacientes' })
  }
}

// Agregar una función para reactivar usuarios
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si el usuario es un paciente, reactivar también en la tabla Patients
    if (user.role === 'patient') {
      const patient = await Patients.findOne({
        where: {
          [Op.or]: [
            { email: user.email },
            { dni: user.username }
          ]
        }
      });

      if (patient) {
        await patient.update({ isActive: true });
      }
    }

    await user.update({ isActive: true });

    res.json({ message: 'Usuario reactivado exitosamente' });
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    res.status(500).json({ message: 'Error al reactivar el usuario' });
  }
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *     responses:
 *       200:
 *         description: Email de reset enviado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No existe un usuario con ese email' });
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en el usuario
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // Crear el enlace de reset
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    // Template del email
    const emailTemplate = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
          .content { background: #fff; padding: 20px; border-radius: 5px; }
          .btn { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔑 Recuperar Contraseña</h2>
          </div>
          <div class="content">
            <p>Hola <strong>${user.name} ${user.lastName}</strong>,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Centro Quiropráctico.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="btn">🔐 Restablecer Contraseña</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace es válido por <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Tu contraseña actual sigue siendo válida hasta que la cambies</li>
              </ul>
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p><strong>Centro Quiropráctico</strong></p>
            <p>Si tienes problemas, contáctanos: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    await sendEmailNotification(
      user.email,
      'Recuperar Contraseña - Centro Quiropráctico',
      emailTemplate
    );

    res.json({ message: 'Se ha enviado un enlace de recuperación a tu email' });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de reset
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await Users.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar tokens
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  changePassword,
  getProfessionals,
  getPatients,
  forgotPassword,
  resetPassword
};