require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const UserModel = require('./models/user-model')

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('✅ Подключено к MongoDB')
        

        const existingSuperAdmin = await UserModel.findOne({ role: 'superadmin' })
        if (existingSuperAdmin) {
            console.log('⚠️ Суперадмин уже существует:', existingSuperAdmin.email)
            process.exit(0)
        }

        const email = 'superadmin@example.com'
        const password = 'superpass123'
        
        const hashPassword = await bcrypt.hash(password, 3)
        
        const superAdmin = await UserModel.create({
            email,
            password: hashPassword,
            role: 'superadmin'
        })
        
        console.log('✅ Суперадмин успешно создан!')
        console.log('📧 Email:', email)
        console.log('🔑 Пароль:', password)
        console.log('👤 ID:', superAdmin._id)
        
        process.exit(0)
    } catch (error) {
        console.error('❌ Ошибка:', error.message)
        process.exit(1)
    }
}

createSuperAdmin()