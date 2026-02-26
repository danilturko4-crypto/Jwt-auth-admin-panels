const FightModel = require('../models/fight-model')
const FighterModel = require('../models/fighter-model')
const TatamiModel = require('../models/tatami-model')
const UserModel = require('../models/user-model')
const ApiError = require('../exceptions/api-error')

class FightService {
    
    // Создать бой (теперь с ID бойцов)
    async createFight(tatamiId, fighter1Id, fighter2Id, userId) {
        const user = await UserModel.findById(userId)
        const tatami = await TatamiModel.findById(tatamiId)

        if (!tatami) {
            throw ApiError.BadRequest('Татами не найдено')
        }

        // Проверка прав
        if (user.role !== 'superadmin' && tatami.admin.toString() !== userId) {
            throw ApiError.BadRequest('У вас нет прав для создания боя на этом татами')
        }

        // Проверяем что бойцы существуют
        const fighter1 = await FighterModel.findById(fighter1Id)
        const fighter2 = await FighterModel.findById(fighter2Id)

        if (!fighter1 || !fighter2) {
            throw ApiError.BadRequest('Один или оба бойца не найдены')
        }

        const fight = await FightModel.create({
            tatami: tatamiId,
            fighter1: fighter1Id,
            fighter2: fighter2Id
        })

        // Возвращаем с populate
        const populatedFight = await FightModel.findById(fight._id)
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')

        return populatedFight
    }

    // Исправить бойцов в бою (только пока статус scheduled)
    async editFight(fightId, fighter1Id, fighter2Id, userId) {
        const fight = await FightModel.findById(fightId).populate('tatami')
        if (!fight) {
            throw ApiError.BadRequest('Бой не найден')
        }

        if (fight.status !== 'scheduled') {
            throw ApiError.BadRequest('Редактировать можно только запланированный бой')
        }

        const user = await UserModel.findById(userId)
        if (user.role !== 'superadmin' && fight.tatami.admin.toString() !== userId) {
            throw ApiError.BadRequest('У вас нет прав для изменения этого боя')
        }

        if (fighter1Id === fighter2Id) {
            throw ApiError.BadRequest('Бойцы должны быть разными')
        }

        const fighter1 = await FighterModel.findById(fighter1Id)
        const fighter2 = await FighterModel.findById(fighter2Id)
        if (!fighter1 || !fighter2) {
            throw ApiError.BadRequest('Один или оба бойца не найдены')
        }

        fight.fighter1 = fighter1Id
        fight.fighter2 = fighter2Id
        await fight.save()

        const populatedFight = await FightModel.findById(fight._id)
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')

        return populatedFight
    }

    // Получить все бои на татами
    async getFightsByTatami(tatamiId) {
        const fights = await FightModel.find({ tatami: tatamiId })
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')
            .sort({ createdAt: -1 })
        return fights
    }

    // Обновить статус боя
    async updateFightStatus(fightId, status, userId) {
        const fight = await FightModel.findById(fightId).populate('tatami')
        if (!fight) {
            throw ApiError.BadRequest('Бой не найден')
        }

        const user = await UserModel.findById(userId)
        
        if (user.role !== 'superadmin' && fight.tatami.admin.toString() !== userId) {
            throw ApiError.BadRequest('У вас нет прав для изменения этого боя')
        }

        fight.status = status
        if (status === 'in_progress' && !fight.startTime) {
            fight.startTime = new Date()
        }
        if (status === 'completed' && !fight.endTime) {
            fight.endTime = new Date()
        }

        await fight.save()
        
        const populatedFight = await FightModel.findById(fight._id)
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')
            
        return populatedFight
    }

    // Обновить результат боя
    async updateFightResult(fightId, winner, score, userId) {
        const fight = await FightModel.findById(fightId).populate('tatami')
        if (!fight) {
            throw ApiError.BadRequest('Бой не найден')
        }

        const user = await UserModel.findById(userId)
        
        if (user.role !== 'superadmin' && fight.tatami.admin.toString() !== userId) {
            throw ApiError.BadRequest('У вас нет прав для изменения этого боя')
        }

        fight.winner = winner
        fight.score = score
        fight.status = 'completed'
        fight.endTime = new Date()

        await fight.save()
        
        const populatedFight = await FightModel.findById(fight._id)
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')
            
        return populatedFight
    }

    // Получить все бои
    async getAllFights() {
        const fights = await FightModel.find()
            .populate('tatami', 'number name')
            .populate('fighter1', 'name team weight')
            .populate('fighter2', 'name team weight')
            .sort({ createdAt: -1 })
        return fights
    }
}

module.exports = new FightService()