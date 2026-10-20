import express from 'express'
import { register, login, getMe, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

//auth routes
router.post('/register', register)
router.post('/login', login)

// profile routes needs jwt bearer token
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)

export default router
