import path from 'path'
import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import { loggerService } from './services/logger.service.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { toyService } from './api/toy/toy.service.js'

const app = express()
const server = http.createServer(app)

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.use('/api/toy', toyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)

app.get('/*', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const io = new Server(server, {
    cors: {
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://localhost:5174'
        ],
        credentials: true
    }
})

io.on('connection', (socket) => {
    loggerService.info('Socket connected ' + socket.id)

    socket.on('chat:join', ({ toyId }) => {
        try {
            if (!toyId) return
            socket.join(toyId)
        } catch (err) {
            loggerService.error('chat:join error', err)
        }
    })

    socket.on('chat:msg', async ({ toyId, txt, by }) => {
        try {
            if (!toyId || !txt) return
            const byUserId = by?.userId || null
            const byUsername = by?.username || 'Guest'
            const msgToSave = await toyService.addChatMessage(toyId, {
                byUserId,
                byUsername,
                txt,
            })
            io.to(toyId).emit('chat:msg', msgToSave)
        } catch (err) {
            loggerService.error('chat:msg error', err)
        }
    })

    socket.on('chat:typing', ({ toyId, username, isTyping }) => {
        try {
            if (!toyId || !username) return
            socket.to(toyId).emit('chat:typing', { username, isTyping: !!isTyping })
        } catch (err) {
            loggerService.error('chat:typing error', err)
        }
    })

    socket.on('disconnect', () => {
        // no-op for now
    })
})

const PORT = process.env.PORT || 3030
server.listen(PORT, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
})