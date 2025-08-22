import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getToys, getToyById, addToy, updateToy, removeToy } from './toy.controller.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', log, getToys)
toyRoutes.get('/:id', log, getToyById)
toyRoutes.post('/', log, requireAuth, addToy)
toyRoutes.put('/:id', log, requireAuth, updateToy)
toyRoutes.delete('/:id', log, requireAuth, removeToy)