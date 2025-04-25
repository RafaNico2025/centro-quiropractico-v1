import { Patients } from '../../database/connection.database.js';

// Crear un nuevo paciente
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
      emergencyPhone
    } = req.body;

    // Validar que no exista un paciente con el mismo DNI
    const existingPatient = await Patients.findOne({ where: { dni } });
    if (existingPatient) {
      return res.status(400).json({ message: 'Ya existe un paciente con ese DNI' });
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
      emergencyPhone
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ message: 'Error al crear el paciente' });
  }
};

// Obtener todos los pacientes
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
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json(patients);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error al obtener los pacientes' });
  }
};

// Obtener un paciente por ID
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

// Actualizar un paciente
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

    // Si se cambia el DNI, validar que no exista otro paciente con el mismo DNI
    if (dni && dni !== patient.dni) {
      const existingPatient = await Patients.findOne({ where: { dni } });
      if (existingPatient) {
        return res.status(400).json({ message: 'Ya existe un paciente con ese DNI' });
      }
    }

    await patient.update({
      firstName: firstName || patient.firstName,
      lastName: lastName || patient.lastName,
      dni: dni || patient.dni,
      phone: phone || patient.phone,
      email: email || patient.email,
      address: address || patient.address,
      birthDate: birthDate || patient.birthDate,
      gender: gender || patient.gender,
      emergencyContact: emergencyContact || patient.emergencyContact,
      emergencyPhone: emergencyPhone || patient.emergencyPhone
    });

    res.json(patient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ message: 'Error al actualizar el paciente' });
  }
};

// Eliminar un paciente
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patients.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    await patient.destroy();
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar el paciente' });
  }
};

export default {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
}; 