import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            inStock: req.query.inStock || '',
            minPrice: req.query.minPrice || '',
            labels: req.query.labels ? (Array.isArray(req.query.labels) ? req.query.labels : [req.query.labels]) : [],
            sortBy: req.query.sortBy || 'name',
            sortDir: +req.query.sortDir || 1
        }
        const toys = await toyService.query(filterBy)
        res.json(toys)
    } catch (err) {
        loggerService.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        loggerService.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    try {
        const toy = req.body
        const loggedInUser = req.loggedInUser
        const addedToy = await toyService.add(toy, loggedInUser)
        res.json(addedToy)
    } catch (err) {
        loggerService.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = { ...req.body, _id: req.params.id }
        const loggedInUser = req.loggedInUser
        const updatedToy = await toyService.update(toy, loggedInUser)
        res.json(updatedToy)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const loggedInUser = req.loggedInUser
        const deletedCount = await toyService.remove(toyId, loggedInUser)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        loggerService.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}