const ApiError = require('../exceptions/api-error')
const fighterService = require('../service/fighter-service')
const { validationResult } = require('express-validator')

class FighterController {
    
    async createFighter(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { name, team, weight } = req.body
            const userId = req.user.id
            
            const fighter = await fighterService.createFighter(name, team, weight, userId)
            return res.json(fighter)
        } catch (error) {
            next(error)
        }
    }

    async getAllFighters(req, res, next) {
        try {
            const fighters = await fighterService.getAllFighters()
            return res.json(fighters)
        } catch (error) {
            next(error)
        }
    }

    async getMyFighters(req, res, next) {
        try {
            const adminId = req.user.id
            const fighters = await fighterService.getFightersByAdmin(adminId)
            return res.json(fighters)
        } catch (error) {
            next(error)
        }
    }

    async updateFighter(req, res, next) {
        try {
            const { fighterId, name, team, weight } = req.body
            const userId = req.user.id
            const fighter = await fighterService.updateFighter(fighterId, name, team, weight, userId)
            return res.json(fighter)
        } catch (error) {
            next(error)
        }
    }

    async deleteFighter(req, res, next) {
        try {
            const { fighterId } = req.body
            const userId = req.user.id
            const result = await fighterService.deleteFighter(fighterId, userId)
            return res.json(result)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new FighterController()