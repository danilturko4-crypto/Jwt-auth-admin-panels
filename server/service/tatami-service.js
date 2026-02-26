const TatamiModel = require('../models/tatami-model')
const UserModel = require('../models/user-model')
const ApiError = require('../exceptions/api-error')

class TatamiService {
    
    async createTatami(number, name, adminId, creatorId) {
        const creator = await UserModel.findById(creatorId)
        if (!creator || creator.role !== 'superadmin') {
            throw ApiError.BadRequest('Только суперадмин может создавать татами')
        }

        const admin = await UserModel.findById(adminId)
        if (!admin || admin.role !== 'admin') {
            throw ApiError.BadRequest('Указанный админ не найден')
        }

        if (admin.assignedTatami) {
            throw ApiError.BadRequest('Этот админ уже привязан к другому татами')
        }

        const existingTatami = await TatamiModel.findOne({ number })
        if (existingTatami) {
            throw ApiError.BadRequest(`Татами №${number} уже существует`)
        }

        const tatami = await TatamiModel.create({
            number,
            name,
            admin: adminId
        })

        admin.assignedTatami = tatami._id
        await admin.save()

        return tatami
    }

    async getAllTatami() {
        const tatamis = await TatamiModel.find().populate('admin', 'email')
        return tatamis
    }

    async getTatamiByAdmin(adminId) {
        const tatami = await TatamiModel.findOne({ admin: adminId })
        return tatami
    }

    async deleteTatami(tatamiId, userId) {
        const user = await UserModel.findById(userId)
        if (!user || user.role !== 'superadmin') {
            throw ApiError.BadRequest('Только суперадмин может удалять татами')
        }

        const tatami = await TatamiModel.findById(tatamiId)
        if (!tatami) {
            throw ApiError.BadRequest('Татами не найдено')
        }

        await UserModel.findByIdAndUpdate(tatami.admin, { assignedTatami: null })
        await TatamiModel.findByIdAndDelete(tatamiId)
    }

    async updateTatamiStatus(tatamiId, isActive, userId) {
        const user = await UserModel.findById(userId)
        if (!user || user.role !== 'superadmin') {
            throw ApiError.BadRequest('Только суперадмин может изменять статус татами')
        }

        const tatami = await TatamiModel.findByIdAndUpdate(
            tatamiId,
            { isActive },
            { new: true }
        )

        if (!tatami) {
            throw ApiError.BadRequest('Татами не найдено')
        }

        return tatami
    }
}

module.exports = new TatamiService()