const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    roomId: { type: Number, required: true, unique: true },       // 房间号
    owner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: { type: String, required: true },
        avatar: { type: String },
        level: { type: Number }
    },

    config: {
        mapType: { type: Number, default: 0 },
        maxPlayers: { type: Number, default: 6 }
    },

    players: [{
        userId: { type: String },
        username: { type: String, required: true },
        score: { type: Number, default: 0 },
        online: { type: Boolean, default: true },
        lastMoveAt: { type: Date, default: Date.now },
        // 暂时不设置timeLimit
        // timeLimit:{type:Number, default:20},
        gameBoard: {
            type: Array,
            default: []
        },
        level: { type: Number },
        isReady: { type: Boolean, default: false }
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
