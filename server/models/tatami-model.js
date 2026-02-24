const { Schema, model } = require('mongoose')

const TatamiSchema = new Schema({
    number: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = model('Tatami', TatamiSchema)