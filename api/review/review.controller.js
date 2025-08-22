import { loggerService } from '../../services/logger.service.js'
import { authService } from '../auth/auth.service.js'
import { toyService } from '../toy/toy.service.js'
import { reviewService } from './review.service.js'

export async function getReviews(req, res) {
    try {
        // Support both nested filterBy and top-level query params
        let filterBy = {}

        const rawFilter = req.query.filterBy
        if (rawFilter) {
            try {
                const parsed = typeof rawFilter === 'string' ? JSON.parse(rawFilter) : rawFilter
                if (parsed?.aboutToyId) filterBy.aboutToyId = parsed.aboutToyId
                if (parsed?.byUserId) filterBy.byUserId = parsed.byUserId
            } catch (e) {
                // Ignore malformed filterBy
            }
        }

        if (req.query.aboutToyId) filterBy.aboutToyId = req.query.aboutToyId
        if (req.query.byUserId) filterBy.byUserId = req.query.byUserId

        const reviews = await reviewService.query(filterBy)
        res.send(reviews)
    } catch (err) {
        loggerService.error('Cannot get reviews', err)
        res.status(400).send({ err: 'Failed to get reviews' })
    }
}

export async function deleteReview(req, res) {
    const { id: reviewId } = req.params

    try {
        await reviewService.remove(reviewId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}

export async function addReview(req, res) {
    const { loggedInUser } = req

    try {
        if (!loggedInUser) {
            throw new Error('User not authenticated')
        }
        var review = req.body
        const { aboutToyId } = review
        review.byUserId = loggedInUser._id
        review = await reviewService.add(review)

        // prepare the updated review for sending out
        review.byUser = loggedInUser
        review.aboutToy = await toyService.getById(aboutToyId)
        review.createdAt = review._id.getTimestamp()

        delete review.aboutToy.reviews
        delete review.aboutToyId
        delete review.byUserId

        res.send(review)
    } catch (err) {
        loggerService.error('Failed to add review', err)
        res.status(401).send({ err: 'Failed to add review: ' + err.message })
    }
}