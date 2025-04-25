import Income from '../../models/Income.js';
import { Incomes } from '../../database/connection.database.js';
import { Op } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     Income:
 *       type: object
 *       required:
 *         - amount
 *         - date
 *         - patientId
 *         - description
 *       properties:
 *         amount:
 *           type: number
 *           description: Monto del ingreso
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha del ingreso
 *         patientId:
 *           type: integer
 *           description: ID del paciente asociado
 *         description:
 *           type: string
 *           description: Descripción del ingreso
 *         paymentMethod:
 *           type: string
 *           description: Método de pago
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled]
 *           default: pending
 *           description: Estado del pago
 */

/**
 * @swagger
 * /incomes:
 *   post:
 *     summary: Crear un nuevo ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       201:
 *         description: Ingreso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Income'
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
export const createIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   get:
 *     summary: Obtener un ingreso por ID
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Datos del ingreso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Income'
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
export const getIncome = async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   put:
 *     summary: Actualizar un ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ingreso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       200:
 *         description: Ingreso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Income'
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
export const updateIncome = async (req, res) => {
  try {
    const [updated] = await Income.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedIncome = await Income.findByPk(req.params.id);
      res.json(updatedIncome);
    } else {
      res.status(404).json({ error: 'Ingreso no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   delete:
 *     summary: Eliminar un ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ingreso
 *     responses:
 *       204:
 *         description: Ingreso eliminado exitosamente
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
export const deleteIncome = async (req, res) => {
  try {
    const deleted = await Income.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Ingreso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /incomes/date-range:
 *   get:
 *     summary: Obtener ingresos por rango de fechas
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Lista de ingresos en el rango de fechas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Income'
 *       500:
 *         description: Error del servidor
 */
export const getIncomesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const incomes = await Income.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /incomes/patient/{patientId}:
 *   get:
 *     summary: Obtener ingresos por paciente
 *     tags: [Ingresos]
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
 *         description: Lista de ingresos del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Income'
 *       500:
 *         description: Error del servidor
 */
export const getIncomesByPatient = async (req, res) => {
  try {
    const incomes = await Income.findAll({
      where: { patientId: req.params.patientId }
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 