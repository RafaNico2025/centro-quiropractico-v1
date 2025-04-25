import { Users } from '../../database/connection.database.js';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ['Password'] }, // Excluir la contraseña
      order: [['Username', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
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

// Crear un nuevo usuario
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

// Actualizar un usuario
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

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No permitir eliminar el último administrador
    if (user.Role === 'admin') {
      const adminCount = await Users.count({ where: { Role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'No se puede eliminar el último administrador' });
      }
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

// Cambiar contraseña
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

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
}; 