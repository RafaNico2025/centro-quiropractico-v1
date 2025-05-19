import { Users, Patients } from '../../database/connection.database.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

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
 *         Password:
 *           type: string
 *           description: Contraseña del usuario
 *         Nombre:
 *           type: string
 *           description: Nombre del usuario
 *         Apellido:
 *           type: string
 *           description: Apellido del usuario
 *         Telefono:
 *           type: string
 *           description: Teléfono del usuario
 *         Email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         Role:
 *           type: string
 *           enum: [admin, user, staff]
 *           default: user
 *           description: Rol del usuario
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
      attributes: { exclude: ['Password'] }
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

    // Verificar si el usuario ya existe
    const existingUser = await Users.findOne({ where: { Username } });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = await Users.create({
      Username,
      Password: hashedPassword,
      Nombre,
      Apellido,
      Telefono,
      Email,
      Role: Role || 'user' // Rol por defecto
    });

    // Excluir la contraseña en la respuesta
    const { Password: _, ...userWithoutPassword } = newUser.toJSON();
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
    if (Username && Username !== user.Username) {
      const existingUser = await Users.findOne({ where: { Username } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
      }
    }

    // Si se cambia la contraseña, encriptarla
    let hashedPassword = user.Password;
    if (Password) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    await user.update({
      Username: Username || user.Username,
      Password: hashedPassword,
      Nombre: Nombre || user.Nombre,
      Apellido: Apellido || user.Apellido,
      Telefono: Telefono || user.Telefono,
      Email: Email || user.Email,
      Role: Role || user.Role
    });

    // Excluir la contraseña en la respuesta
    const { Password: _, ...userWithoutPassword } = user.toJSON();
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
    const isPasswordValid = await bcrypt.compare(currentPassword, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar y guardar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ Password: hashedPassword });

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
    const patients = await Patients.findAll({
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

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  changePassword,
  getProfessionals,
  getPatients
}; 