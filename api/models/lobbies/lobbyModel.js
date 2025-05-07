const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    roomId: { type: Number, required: true, unique: true },
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

    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String, required: true },
        avatar: String,
        isReady: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        level: { type: Number }
    }],
    maxPlayers: { type: Number, default: 6 },
    status: { type: String, enum: ['waiting', 'playing', 'ended'], default: 'waiting' },
    config: {
        mode: { type: String, default: 'classic' },
        difficulty: { type: String, default: 'normal' }
    },
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now }
});

// 自动更新时间戳
LobbySchema.pre('save', function (next) {
    this.updateTime = new Date();
    next();
});

module.exports = mongoose.model('Lobby', LobbySchema);
