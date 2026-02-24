const { Schema, model } = require('mongoose')

const FighterSchema = new Schema({
    name: { type: String, required: true },
    team: { type: String, default: '' },
    weight: { type: String, default: '' },
    birthDate: { type: Date },
    photo: { type: String }, // URL фото (опционально)
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = model('Fighter', FighterSchema)