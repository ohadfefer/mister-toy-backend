import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
    query,
    getById,
    remove,
    add,
    update
}

async function query(filterBy = { txt: '', inStock: '', minPrice: '', labels: [], sortBy: 'name', sortDir: 1 }) {
    try {
        const criteria = {}
        if (filterBy.txt) {
            criteria.name = { $regex: filterBy.txt, $options: 'i' }
        }
        if (filterBy.inStock !== '') {
            criteria.inStock = filterBy.inStock === 'true'
        }
        if (filterBy.minPrice !== '') {
            criteria.price = { $gte: +filterBy.minPrice }
        }
        if (filterBy.labels.length > 0) {
            criteria.labels = { $all: filterBy.labels }
        }

        const sort = {}
        if (filterBy.sortBy) {
            sort[filterBy.sortBy] = filterBy.sortDir
        }

        const collection = await dbService.getCollection('toy')
        const toys = await collection.find(criteria).sort(sort).toArray()
        return toys
    } catch (err) {
        logger.error('Cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        if (!toy) throw new Error('Toy not found')
        return toy
    } catch (err) {
        logger.error(`While finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId, loggedinUser) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        if (!toy) throw new Error('Toy not found')
        if (!loggedinUser.isAdmin && toy.owner._id.toString() !== loggedinUser._id) {
            throw new Error('Not your toy')
        }
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        logger.error(`Cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy, loggedinUser) {
    try {
        const toyToAdd = {
            name: toy.name || 'Unnamed Toy',
            price: toy.price || 0,
            inStock: toy.inStock !== undefined ? toy.inStock : true,
            imgUrl: toy.imgUrl || 'https://picsum.photos/200/200?random=999',
            labels: toy.labels || [],
            createdAt: toy.createdAt || Date.now(),
            owner: {
                _id: ObjectId.createFromHexString(loggedinUser._id),
                fullname: loggedinUser.fullname
            }
        }
        const collection = await dbService.getCollection('toy')
        const result = await collection.insertOne(toyToAdd)
        toyToAdd._id = result.insertedId
        return toyToAdd
    } catch (err) {
        logger.error('Cannot insert toy', err)
        throw err
    }
}

async function update(toy, loggedinUser) {
    try {
        const existingToy = await getById(toy._id)
        if (!loggedinUser.isAdmin && existingToy.owner._id.toString() !== loggedinUser._id) {
            throw new Error('Not your toy')
        }
        const toyToSave = {
            name: toy.name || 'Unnamed Toy',
            price: toy.price || 0,
            inStock: toy.inStock !== undefined ? toy.inStock : true,
            imgUrl: toy.imgUrl || 'https://picsum.photos/200/200?random=999',
            labels: toy.labels || [],
            createdAt: toy.createdAt || Date.now(),
            owner: existingToy.owner
        }
        const collection = await dbService.getCollection('toy')
        const result = await collection.updateOne(
            { _id: ObjectId.createFromHexString(toy._id) },
            { $set: toyToSave }
        )
        if (result.matchedCount === 0) throw new Error('Toy not found')
        return toy
    } catch (err) {
        logger.error(`Cannot update toy ${toy._id}`, err)
        throw err
    }
}