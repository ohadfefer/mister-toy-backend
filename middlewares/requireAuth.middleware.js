import { authService } from '../api/auth/auth.service.js'
import { loggerService } from '../services/logger.service.js'

export async function requireAuth(req, res, next) {
    if (!req?.cookies?.loginToken) {
        loggerService.error('No login token provided')
        return res.status(401).send('Not Authenticated')
    }

    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) {
        loggerService.error('Invalid login token')
        return res.status(401).send('Not Authenticated')
    }

    req.loggedInUser = loggedInUser
    next()
}

export async function requireAdmin(req, res, next) {
    if (!req?.cookies?.loginToken) {
        loggerService.error('No login token provided')
        return res.status(401).send('Not Authenticated')
    }

    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedInUser.isAdmin) {
        loggerService.warn(loggedInUser.fullname + ' attempted to perform admin action')
        res.status(403).end('Not Authorized')
        return
    }

    next()
}