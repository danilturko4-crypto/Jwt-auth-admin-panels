const ApiError = require('../exceptions/api-error')
const tatamiService = require('../service/tatami-service')
const { validationResult } = require('express-validator')

class TatamiController {
    
async createTatami(req, res, next) {
    try {
        console.log('📥 Получен запрос на создание татами')
        console.log('📥 req.body:', req.body)
        console.log('📥 req.user:', req.user)
        
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log('❌ Ошибки валидации:', errors.array())
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
        }
        
        const { number, name, adminId } = req.body
        console.log('📥 Извлеченные данные:', { 
            number, 
            name, 
            adminId,
            adminIdType: typeof adminId 
        })
        
        const creatorId = req.user.id
        
        const tatami = await tatamiService.createTatami(number, name, adminId, creatorId)
        return res.json(tatami)
    } catch (error) {
        console.error('❌ Ошибка в контроллере:', error)
        next(error)
    }
}

    async getAllTatami(req, res, next) {
        try {
            const tatamis = await tatamiService.getAllTatami()
            return res.json(tatamis)
        } catch (error) {
            next(error)
        }
    }

    async getMyTatami(req, res, next) {
        try {
            const adminId = req.user.id
            const tatami = await tatamiService.getTatamiByAdmin(adminId)
            return res.json(tatami)
        } catch (error) {
            next(error)
        }
    }

    async deleteTatami(req, res, next) {
        try {
            const { tatamiId } = req.body
            const userId = req.user.id
            await tatamiService.deleteTatami(tatamiId, userId)
            return res.json({ message: 'Татами удалено' })
        } catch (error) {
            next(error)
        }
    }

    async updateTatamiStatus(req, res, next) {
        try {
            const { tatamiId, isActive } = req.body
            const userId = req.user.id
            const tatami = await tatamiService.updateTatamiStatus(tatamiId, isActive, userId)
            return res.json(tatami)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new TatamiController()