const FighterModel = require('../models/fighter-model')
const UserModel = require('../models/user-model')
const ApiError = require('../exceptions/api-error')

class FighterService {
    
    // Создать бойца
    async createFighter(name, team, weight, userId) {
        const user = await UserModel.findById(userId)
        
        // Проверяем права (админ или суперадмин)
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            throw ApiError.BadRequest('Нет прав для создания бойца')
        }

        const fighter = await FighterModel.create({
            name,
            team: team || '',
            weight: weight || '',
            createdBy: userId
        })

        return fighter
    }

    // Получить всех бойцов
    async getAllFighters() {
        const fighters = await FighterModel.find().sort({ name: 1 })
        return fighters
    }

    // Получить бойцов созданных конкретным админом
    async getFightersByAdmin(adminId) {
        const fighters = await FighterModel.find({ createdBy: adminId }).sort({ name: 1 })
        return fighters
    }

    // Обновить бойца
    async updateFighter(fighterId, name, team, weight, userId) {
        const fighter = await FighterModel.findById(fighterId)
        
        if (!fighter) {
            throw ApiError.BadRequest('Боец не найден')
        }

        const user = await UserModel.findById(userId)
        
        // Может редактировать создатель или суперадмин
        if (user.role !== 'superadmin' && fighter.createdBy.toString() !== userId) {
            throw ApiError.BadRequest('Нет прав для редактирования')
        }

        fighter.name = name
        fighter.team = team || ''
        fighter.weight = weight || ''
        await fighter.save()

        return fighter
    }

    // Удалить бойца
    async deleteFighter(fighterId, userId) {
        const fighter = await FighterModel.findById(fighterId)
        
        if (!fighter) {
            throw ApiError.BadRequest('Боец не найден')
        }

        const user = await UserModel.findById(userId)
        
        if (user.role !== 'superadmin' && fighter.createdBy.toString() !== userId) {
            throw ApiError.BadRequest('Нет прав для удаления')
        }

        await FighterModel.findByIdAndDelete(fighterId)
        return { message: 'Боец удален' }
    }
}

module.exports = new FighterService()