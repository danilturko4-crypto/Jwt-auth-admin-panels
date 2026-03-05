const TatamiModel = require('../models/tatami-model')
const FightModel = require('../models/fight-model')
const FighterModel = require('../models/fighter-model')  // ← Добавьте этот импорт!

class PublicController {
    
    async getActiveTatamis(req, res, next) {
        try {
            console.log('📥 Запрос на получение активных татами')
            const tatamis = await TatamiModel.find({ isActive: true })
                .populate('admin', 'email')
                .sort({ number: 1 })
            
            console.log('✅ Найдено татами:', tatamis.length)
            return res.json(tatamis)
        } catch (error) {
            console.error('❌ Ошибка получения татами:', error)
            next(error)
        }
    }

    async getActiveFights(req, res, next) {
        try {
            console.log('📥 Запрос на получение активных боев')
            const fights = await FightModel.find({
                status: { $in: ['scheduled', 'in_progress', 'completed'] }
            })
                .populate('tatami', 'number name')
                .populate('fighter1', 'name team weight')
                .populate('fighter2', 'name team weight')
                .sort({ createdAt: -1 })
            
            console.log('✅ Найдено активных боев:', fights.length)
            return res.json(fights)
        } catch (error) {
            console.error('❌ Ошибка получения боев:', error)
            next(error)
        }
    }

    async getFightsByTatami(req, res, next) {
        try {
            const { tatamiId } = req.params
            console.log('📥 Запрос боев для татами:', tatamiId)
            
            const fights = await FightModel.find({ tatami: tatamiId })
                .populate('tatami', 'number name')
                .populate('fighter1', 'name team weight')
                .populate('fighter2', 'name team weight')
                .sort({ createdAt: -1 })
            
            console.log('✅ Найдено боев:', fights.length)
            return res.json(fights)
        } catch (error) {
            console.error('❌ Ошибка получения боев татами:', error)
            next(error)
        }
    }

    // ← ДОБАВЬТЕ ЭТОТ МЕТОД!
    async getAllFighters(req, res, next) {
        try {
            console.log('📥 Запрос на получение всех бойцов (публичный)')
            const fighters = await FighterModel.find().sort({ name: 1 })
            
            console.log('✅ Найдено бойцов:', fighters.length)
            return res.json(fighters)
        } catch (error) {
            console.error('❌ Ошибка получения бойцов:', error)
            next(error)
        }
    }

    async getFighterStats(req, res, next) {
        try {
            const { fighterId } = req.params
            
            console.log('📥 Ищем статистику для бойца ID:', fighterId)

            const fighter = await FighterModel.findById(fighterId)
            if (!fighter) {
                return res.status(404).json({ message: 'Боец не найден' })
            }

            const fights = await FightModel.find({
                $or: [
                    { fighter1: fighterId },
                    { fighter2: fighterId }
                ],
                status: 'completed'
            })
                .populate('tatami', 'number name')
                .populate('fighter1', 'name team weight')
                .populate('fighter2', 'name team weight')

            let wins = 0
            let losses = 0
            let draws = 0
            let totalScore = 0
            let opponentScore = 0
            const fightHistory = []

            fights.forEach(fight => {
                const isFighter1 = fight.fighter1._id.toString() === fighterId
                
                if (isFighter1) {
                    totalScore += fight.score.fighter1
                    opponentScore += fight.score.fighter2
                    
                    if (fight.winner === 'fighter1') wins++
                    else if (fight.winner === 'fighter2') losses++
                    else draws++

                    fightHistory.push({
                        _id: fight._id,
                        tatami: fight.tatami,
                        opponent: fight.fighter2,
                        myScore: fight.score.fighter1,
                        opponentScore: fight.score.fighter2,
                        result: fight.winner === 'fighter1' ? 'win' 
                              : fight.winner === 'fighter2' ? 'loss' : 'draw',
                        createdAt: fight.createdAt
                    })
                } else {
                    totalScore += fight.score.fighter2
                    opponentScore += fight.score.fighter1
                    
                    if (fight.winner === 'fighter2') wins++
                    else if (fight.winner === 'fighter1') losses++
                    else draws++

                    fightHistory.push({
                        _id: fight._id,
                        tatami: fight.tatami,
                        opponent: fight.fighter1,
                        myScore: fight.score.fighter2,
                        opponentScore: fight.score.fighter1,
                        result: fight.winner === 'fighter2' ? 'win' 
                              : fight.winner === 'fighter1' ? 'loss' : 'draw',
                        createdAt: fight.createdAt
                    })
                }
            })

            const stats = {
                fighter,
                totalFights: fights.length,
                wins,
                losses,
                draws,
                winRate: fights.length > 0 
                    ? ((wins / fights.length) * 100).toFixed(1) 
                    : '0',
                totalScore,
                opponentScore,
                averageScore: fights.length > 0 
                    ? (totalScore / fights.length).toFixed(1) 
                    : '0',
                fightHistory: fightHistory.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            }

            return res.json(stats)
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error)
            next(error)
        }
    }
}

module.exports = new PublicController()