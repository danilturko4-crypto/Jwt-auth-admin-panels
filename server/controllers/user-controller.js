const ApiError = require('../exceptions/api-error')
const userService = require('../service/user-service')
const { validationResult } = require('express-validator')

class UserController {
    
    async createAdmin(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { email, password } = req.body
            const creatorId = req.user.id
            
            const admin = await userService.createAdmin(email, password, creatorId)
            return res.json(admin)
        } catch (error) {
            next(error)
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            })
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (error) {
            next(error)
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            })
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    }

    async getAdmins(req, res, next) {
        try {
            const admins = await userService.getAllAdmins()
            return res.json(admins)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()