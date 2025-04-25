import { MedicalHistories } from '../../database/connection.database.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalHistory:
 *       type: object
 *       required:
 *         - patientId
 *         - appointmentId
 *         - professionalId
 *       properties:
 *         patientId:
 *           type: integer
 *           description: ID del paciente
 *         appointmentId:
 *           type: integer
 *           description: ID de la cita asociada
 *         professionalId:
 *           type: integer
 *           description: ID del profesional que registra el historial
 *         diagnosis:
 *           type: string
 *           description: Diagnóstico del paciente
 *         treatment:
 *           type: string
 *           description: Tratamiento indicado
 *         observations:
 *           type: string
 *           description: Observaciones adicionales
 *         medications:
 *           type: string
 *           description: Medicamentos recetados
 *         allergies:
 *           type: string
 *           description: Alergias del paciente
 *         previousConditions:
 *           type: string
 *           description: Condiciones médicas previas
 *         familyHistory:
 *           type: string
 *           description: Historial familiar
 */

/**
 * @swagger
 * /medical-history:
 *   post:
 *     summary: Crear un nuevo registro de historial médico
 *     tags: [Historial Médico]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalHistory'
 *     responses:
 *       201:
 *         description: Historial médico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalHistory'
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
export const createMedicalHistory = async (req, res) => {
  try {
    const medicalHistory = await MedicalHistories.create(req.body);
    res.status(201).json(medicalHistory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /medical-history/{id}:
 *   get:
 *     summary: Obtener un registro de historial médico por ID
 *     tags: [Historial Médico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial médico
 *     responses:
 *       200:
 *         description: Datos del historial médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalHistory'
 *       404:
 *         description: Historial médico no encontrado
 *       500:
 *         description: Error del servidor
 */
export const getMedicalHistory = async (req, res) => {
  try {
    const medicalHistory = await MedicalHistories.findByPk(req.params.id);
    if (!medicalHistory) {
      return res.status(404).json({ error: 'Historial médico no encontrado' });
    }
    res.json(medicalHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /medical-history/{id}:
 *   put:
 *     summary: Actualizar un registro de historial médico
 *     tags: [Historial Médico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial médico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalHistory'
 *     responses:
 *       200:
 *         description: Historial médico actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalHistory'
 *       404:
 *         description: Historial médico no encontrado
 *       500:
 *         description: Error del servidor
 */
export const updateMedicalHistory = async (req, res) => {
  try {
    const [updated] = await MedicalHistories.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedMedicalHistory = await MedicalHistories.findByPk(req.params.id);
      res.json(updatedMedicalHistory);
    } else {
      res.status(404).json({ error: 'Historial médico no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /medical-history/{id}:
 *   delete:
 *     summary: Eliminar un registro de historial médico
 *     tags: [Historial Médico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial médico
 *     responses:
 *       204:
 *         description: Historial médico eliminado exitosamente
 *       404:
 *         description: Historial médico no encontrado
 *       500:
 *         description: Error del servidor
 */
export const deleteMedicalHistory = async (req, res) => {
  try {
    const deleted = await MedicalHistories.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Historial médico no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /medical-history/patient/{patientId}:
 *   get:
 *     summary: Obtener el historial médico de un paciente
 *     tags: [Historial Médico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Lista de registros del historial médico del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicalHistory'
 *       404:
 *         description: No se encontraron registros para el paciente
 *       500:
 *         description: Error del servidor
 */
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const medicalHistory = await MedicalHistories.findAll({
      where: { patientId: req.params.patientId },
      order: [['createdAt', 'DESC']]
    });
    if (!medicalHistory.length) {
      return res.status(404).json({ error: 'No se encontraron registros para el paciente' });
    }
    res.json(medicalHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
