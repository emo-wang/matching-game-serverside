const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    roomId: { type: Number, required: true, unique: true },       // 房间号（6位随机数或UUID）
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 房主用户ID
    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        nickname: String,
        avatar: String,
        isReady: { type: Boolean, default: false },
        score: { type: Number, default: 0 }
    }],
    maxPlayers: { type: Number, default: 6 },                      // 最大人数，默认4人
    status: { type: String, enum: ['waiting', 'playing', 'ended'], default: 'waiting' },
    config: {
        mode: { type: String, default: 'classic' },                  // 游戏模式
        difficulty: { type: String, default: 'normal' }              // 难度
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
