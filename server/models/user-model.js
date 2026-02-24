const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assignedTatami: { type: Schema.Types.ObjectId, ref: 'Tatami', default: null } // Привязка к татами
})

module.exports = model('User', UserSchema)