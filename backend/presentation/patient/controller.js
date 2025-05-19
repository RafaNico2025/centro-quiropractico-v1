import { Patients, Users } from '../../database/connection.database.js';
import { Op } from 'sequelize';

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
        { dni: { [Op.iLike]: `%${search}%` } }
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
 *       204:
 *         description: Paciente eliminado exitosamente
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
    await patient.destroy();
    res.json({ message: 'Paciente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar el paciente' });
  }
};

export {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
}; 