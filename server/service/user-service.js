const userModel = require("../models/user-model")
const bcrypt = require('bcrypt')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto') 
const ApiError = require('../exceptions/api-error')

class UserService {

    async createSuperAdmin(email, password){
        const candidate = await userModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const user = await userModel.create({
            email, 
            password: hashPassword, 
            role: 'superadmin'
        })
        
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return { ...tokens, user: userDto }
    }

    async createAdmin(email, password, creatorId){

        const creator = await userModel.findById(creatorId)
        if(!creator || creator.role !== 'superadmin'){
            throw ApiError.BadRequest('Только суперадмин может создавать админов')
        }

        const candidate = await userModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest(`Админ с email ${email} уже существует`)
        }
        
        const hashPassword = await bcrypt.hash(password, 3)
        const user = await userModel.create({
            email, 
            password: hashPassword, 
            role: 'admin',
            createdBy: creatorId
        })
        
        return user 
    }

    async login(email, password){
        const user = await userModel.findOne({email})
        if(!user){
            throw ApiError.BadRequest('Пользователь не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return { ...tokens, user: userDto }
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError()
        }
        const user = await userModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return { ...tokens, user: userDto }
    }

async getAllAdmins(){
    const admins = await userModel.find({ role: 'admin' })

    const adminsDto = admins.map(admin => ({
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        assignedTatami: Array.isArray(admin.assignedTatami) ? admin.assignedTatami.map(t => t.toString()) : []
    }))

    console.log('📤 Отправка списка админов:', adminsDto)
    return adminsDto
}

}
module.exports = new UserService()