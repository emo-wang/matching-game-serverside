const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    roomId: { type: Number, required: true, unique: true },       // 房间号

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 房主ID
    players: [{
        userId: { type: String },
        nickname: { type: String },
        score: { type: Number, default: 0 },
        online: { type: Boolean, default: true },
        lastMoveAt: { type: Date, default: Date.now },
        gameBoard: {
            type: Array,
            default: []
        }
    }],

    status: {
        type: String,
        enum: ['waiting', 'playing', 'paused', 'ended'],
        default: 'waiting'
    },

    countdown: { type: Number, default: 300 },

    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 自动更新时间
GameSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Game', GameSchema);
