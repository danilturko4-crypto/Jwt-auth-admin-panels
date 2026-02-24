const { Schema, model } = require('mongoose')

const FightSchema = new Schema({
    tatami: { type: Schema.Types.ObjectId, ref: 'Tatami', required: true },
    fighter1: { type: Schema.Types.ObjectId, ref: 'Fighter', required: true },
    fighter2: { type: Schema.Types.ObjectId, ref: 'Fighter', required: true },
    status: { 
        type: String, 
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    startTime: { type: Date },
    endTime: { type: Date },
    winner: { type: String, enum: ['fighter1', 'fighter2', 'draw', null], default: null },
    score: {
        fighter1: { type: Number, default: 0 },
        fighter2: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
})

module.exports = model('Fight', FightSchema)