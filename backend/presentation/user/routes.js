import express from 'express'
import { authenticateToken } from '../../middleware/auth.middleware.js'
import userController from './controller.js'

const router = express.Router()

// Rutas protegidas específicas
router.get('/professionals', authenticateToken, userController.getProfessionals)
router.get('/patients', authenticateToken, userController.getPatients)

// Rutas para usuarios
router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)
router.post('/:id/change-password', userController.changePassword)
router.post('/:id/reactivate', userController.reactivateUser)

export default router
