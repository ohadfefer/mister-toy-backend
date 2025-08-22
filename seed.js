import fs from 'fs'
import bcrypt from 'bcrypt'
import { dbService } from './services/db.service.js'
import { loggerService } from './services/logger.service.js'

async function seedDatabase() {
    try {
        // Seed a default user
        const userCollection = await dbService.getCollection('user')
        await userCollection.deleteMany({})
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash('admin123', saltRounds)
        const defaultUser = {
            username: 'admin',
            password: hashedPassword,
            fullname: 'Admin User',
            isAdmin: true
        }
        const userResult = await userCollection.insertOne(defaultUser)
        const userId = userResult.insertedId
        console.log('Seeded admin user:', defaultUser.username)

        // Seed toys
        const data = fs.readFileSync('data/toy.json', 'utf8')
        const toys = JSON.parse(data)
        if (!toys.length) {
            console.error('No toys found in toy.json')
            loggerService.error('No toys found in toy.json')
            return
        }

        const toyCollection = await dbService.getCollection('toy')
        await toyCollection.deleteMany({})
        console.log('Cleared existing toys in toy collection')

        for (const toy of toys) {
            delete toy._id
            await toyCollection.insertOne({
                name: toy.name || 'Unnamed Toy',
                price: toy.price || 0,
                inStock: toy.inStock !== undefined ? toy.inStock : true,
                imgUrl: toy.imgUrl || 'https://picsum.photos/200/200?random=999',
                labels: toy.labels || [],
                createdAt: toy.createdAt || Date.now(),
                owner: {
                    _id: userId,
                    fullname: defaultUser.fullname
                }
            })
        }
        console.log(`Database seeded successfully with ${toys.length} toys`)
    } catch (err) {
        console.error('Error seeding database:', err)
        loggerService.error('Error seeding database', err)
    }
}

seedDatabase()