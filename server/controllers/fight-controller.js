const ApiError = require('../exceptions/api-error')
const fightService = require('../service/fight-service')
const { validationResult } = require('express-validator')

class FightController {
    
    async createFight(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { tatamiId, fighter1Id, fighter2Id } = req.body
            const userId = req.user.id
            
            const fight = await fightService.createFight(tatamiId, fighter1Id, fighter2Id, userId)
            return res.json(fight)
        } catch (error) {
            next(error)
        }
    }

    async getFightsByTatami(req, res, next) {
        try {
            const { tatamiId } = req.params
            const fights = await fightService.getFightsByTatami(tatamiId)
            return res.json(fights)
        } catch (error) {
            next(error)
        }
    }

    async updateFightStatus(req, res, next) {
        try {
            const { fightId, status } = req.body
            const userId = req.user.id
            const fight = await fightService.updateFightStatus(fightId, status, userId)
            return res.json(fight)
        } catch (error) {
            next(error)
        }
    }

    async updateFightResult(req, res, next) {
        try {
            const { fightId, winner, score } = req.body
            const userId = req.user.id
            const fight = await fightService.updateFightResult(fightId, winner, score, userId)
            return res.json(fight)
        } catch (error) {
            next(error)
        }
    }

    async getAllFights(req, res, next) {
        try {
            const fights = await fightService.getAllFights()
            return res.json(fights)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new FightController()