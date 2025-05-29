import { Incomes } from '../../database/connection.database.js';
import { Patients } from '../../database/connection.database.js';
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

export const createIncome = async (req, res) => {
  try {
    const income = await Incomes.create(req.body);
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getIncome = async (req, res) => {
  try {
    const income = await Incomes.findByPk(req.params.id);
    if (!income) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const [updated] = await Incomes.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedIncome = await Incomes.findByPk(req.params.id);
      res.json(updatedIncome);
    } else {
      res.status(404).json({ error: 'Ingreso no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const deleted = await Incomes.destroy({
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

export const getIncomesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const incomes = await Incomes.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        {
          model: Patients,
          attributes: ['id', 'firstName', 'lastName'] // los campos que quieras exponer
        }
      ],
      order: [['date', 'DESC']]
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getIncomesByPatient = async (req, res) => {
  try {
    const incomes = await Incomes.findAll({
      where: { patientId: req.params.patientId }
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyIncomes = async (req, res) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');

    const { count, rows } = await Incomes.findAndCountAll({
      where: {
        date: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: Patients,
          attributes: ['id', 'firstName', 'lastName', 'dni']
        }
      ],
      order: [['date', 'DESC']],
      offset: Number(offset),
      limit: Number(limit)
    });

    console.log(JSON.stringify(rows, null, 2));  // Agregá esto para debuguear

    res.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      incomes: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
