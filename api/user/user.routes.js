import express from 'express'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { deleteUser, getUser, getUsers, updateUser } from './user.controller.js'

export const userRoutes = express.Router()

userRoutes.get('/', getUsers)
userRoutes.get('/:userId', getUser)
userRoutes.put('/:userId', updateUser)
userRoutes.delete('/:userId', requireAuth, requireAdmin, deleteUser)
