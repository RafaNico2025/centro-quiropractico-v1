import { Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';
import { sequelize } from '../../database/connection.database.js';
import { Appointments, MedicalHistories, Incomes } from '../../database/connection.database.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - dni
 *         - phone
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *           description: Nombre del paciente
 *         lastName:
 *           type: string
 *           description: Apellido del paciente
 *         dni:
 *           type: string
 *           description: DNI del paciente (único)
 *         phone:
 *           type: string
 *           description: Teléfono del paciente
 *         email:
 *           type: string
 *           format: email
 *           description: Email del paciente
 *         address:
 *           type: string
 *           description: Dirección del paciente
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del paciente
 *         gender:
 *           type: string
 *           description: Género del paciente
 *         emergencyContact:
 *           type: string
 *           description: Contacto de emergencia
 *         emergencyPhone:
 *           type: string
 *           description: Teléfono de emergencia
 */

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Crear un nuevo paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Error en la solicitud o DNI ya existe
 *       500:
 *         description: Error del servidor
 */
const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dni,
      phone,
      email,
      address,
      birthDate,
      gender,
      emergencyContact,
      emergencyPhone,
      createUser = false
    } = req.body;

    // Validar que no exista un paciente con el mismo DNI
    const existingPatient = await Patients.findOne({ where: { dni } });
    if (existingPatient) {
      return res.status(400).json({ message: 'Ya existe un paciente con ese DNI' });
    }

    // Si se solicita crear usuario, verificar que no exista
    if (createUser) {
      const existingUser = await Users.findOne({ 
        where: { 
          [Op.or]: [
            { email },
            { username: dni }
          ]
        } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Ya existe un usuario con ese email o DNI' });
      }
    }

    const patient = await Patients.create({
      firstName,
      lastName,
      dni,
      phone,
      email,
      address,
      birthDate,
      gender,
      emergencyContact,
      emergencyPhone,
      hasUserAccount: createUser
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ message: 'Error al crear el paciente' });
  }
};

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener todos los pacientes
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
 *                 $ref: '#/components/schemas/Patient'
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
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'dni', 
        'phone', 
        'email', 
        'hasUserAccount',
        'createdAt',
        'updatedAt'
      ]
    });
    res.json(patients);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error al obtener los pacientes' });
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtener un paciente por ID
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Datos del paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patients.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ message: 'Error al obtener el paciente' });
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Actualizar un paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      dni,
      phone,
      email,
      address,
      birthDate,
      gender,
      emergencyContact,
      emergencyPhone
    } = req.body;

    const patient = await Patients.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Si se está actualizando el DNI, verificar que no exista otro paciente con el mismo DNI
    if (dni && dni !== patient.dni) {
      const existingPatient = await Patients.findOne({ where: { dni } });
      if (existingPatient) {
        return res.status(400).json({ message: 'Ya existe un paciente con ese DNI' });
      }
    }

    // Iniciar una transacción para asegurar la integridad de los datos
    await sequelize.transaction(async (t) => {
      // 1. PRIMERO: Buscar el usuario asociado usando la relación directa
      let user = null;
      // Buscar usuario que tenga este patientId
      user = await Users.findOne({
        where: {
          patientId: id // Usar la relación directa
        }
      });
      
      if (user) {
        console.log('Usuario encontrado para sincronización:', user.id, 'Email actual:', user.email);
      } else {
        console.log('No se encontró usuario asociado al paciente con patientId:', id);
      }

      // 2. SEGUNDO: Actualizar el paciente
      await patient.update({
        firstName,
        lastName,
        dni,
        phone,
        email,
        address,
        birthDate,
        gender,
        emergencyContact,
        emergencyPhone
      }, { transaction: t });

      // 3. TERCERO: Si encontramos el usuario, actualizarlo también
      if (user) {
        console.log('Actualizando usuario con ID:', user.id);
        
        // Actualizar los campos del usuario que corresponden al paciente
        const userUpdateData = {};
        
        // Actualizar email si cambió
        if (email && email !== user.email) {
          // Verificar que no exista otro usuario con el nuevo email
          const existingUserWithEmail = await Users.findOne({
            where: { 
              email,
              id: { [Op.ne]: user.id } // Excluir el usuario actual
            }
          });
          if (!existingUserWithEmail) {
            userUpdateData.email = email;
            console.log('Actualizando email del usuario:', user.email, '->', email);
          } else {
            console.log('No se puede actualizar email, ya existe otro usuario con ese email');
          }
        }
        
        // Actualizar nombre y apellido
        if (firstName && firstName !== user.name) {
          userUpdateData.name = firstName;
          console.log('Actualizando nombre del usuario:', user.name, '->', firstName);
        }
        if (lastName && lastName !== user.lastName) {
          userUpdateData.lastName = lastName;
          console.log('Actualizando apellido del usuario:', user.lastName, '->', lastName);
        }
        if (phone && phone !== user.phone) {
          userUpdateData.phone = phone;
          console.log('Actualizando teléfono del usuario:', user.phone, '->', phone);
        }
        
        // Actualizar username solo si el DNI cambió y el username actual era igual al DNI anterior
        // Esto mantiene la consistencia cuando el username se basaba en el DNI
        if (dni && dni !== patient.dni && user.username === patient.dni) {
          // Verificar que no exista otro usuario con el nuevo DNI como username
          const existingUserWithUsername = await Users.findOne({
            where: { 
              username: dni,
              id: { [Op.ne]: user.id } // Excluir el usuario actual
            }
          });
          if (!existingUserWithUsername) {
            userUpdateData.username = dni;
            console.log('Actualizando username del usuario (DNI cambió):', user.username, '->', dni);
          } else {
            console.log('No se puede actualizar username, ya existe otro usuario con ese DNI como username');
          }
        }
        
        // NOTA: No actualizamos el username automáticamente
        // El username es independiente del DNI del paciente y no debe cambiar
        // Si se necesita cambiar el username, debe hacerse manualmente desde la gestión de usuarios
        
        // Actualizar el usuario si hay cambios
        if (Object.keys(userUpdateData).length > 0) {
          console.log('Actualizando usuario con datos:', userUpdateData);
          await user.update(userUpdateData, { transaction: t });
          console.log('Usuario actualizado exitosamente');
        } else {
          console.log('No hay cambios para actualizar en el usuario');
        }
      } else {
        console.log('No se encontró usuario asociado al paciente');
      }
    });

    res.json(patient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ message: 'Error al actualizar el paciente' });
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Eliminar un paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente y sus registros relacionados eliminados exitosamente
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patients.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Iniciar una transacción para asegurar la integridad de los datos
    const result = await sequelize.transaction(async (t) => {
      // 1. Si el paciente tiene una cuenta de usuario, desactivarla
      if (patient.hasUserAccount) {
        const user = await Users.findOne({
          where: {
            [Op.or]: [
              { email: patient.email },
              { username: patient.dni }
            ]
          }
        });
        if (user) {
          await user.update({ isActive: false }, { transaction: t });
        }
      }

      // 2. Marcar como eliminadas las citas relacionadas
      await Appointments.update(
        { deletedAt: new Date() },
        { 
          where: { patientId: id },
          transaction: t 
        }
      );

      // 3. Marcar como eliminadas las historias clínicas
      await MedicalHistories.update(
        { deletedAt: new Date() },
        { 
          where: { patientId: id },
          transaction: t 
        }
      );

      // 4. Marcar como eliminados los ingresos relacionados
      await Incomes.update(
        { deletedAt: new Date() },
        { 
          where: { patientId: id },
          transaction: t 
        }
      );

      // 5. Finalmente, marcar como eliminado el paciente
      await patient.destroy({ transaction: t });

      return true;
    });

    if (result) {
      res.json({ 
        message: 'Paciente y sus registros relacionados eliminados exitosamente',
        details: {
          patientDeleted: true,
          userDeactivated: patient.hasUserAccount,
          appointmentsDeleted: true,
          medicalHistoriesDeleted: true,
          incomesDeleted: true
        }
      });
    }
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el paciente',
      error: error.message 
    });
  }
};

export {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
}; 