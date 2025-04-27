const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },   // 登录名
        password: { type: String, required: true },                  // 加密后的密码
        nickname: { type: String, default: 'nickname' },                  // 显示用的昵称
        avatar: { type: String, default: '' },                       // 头像地址
        rating: { type: Number, default: 1000 },                     // 初始 Elo分数
        level: { type: Number, default: 1 },                         // 等级
        winCount: { type: Number, default: 0 },                      // 胜场数
        loseCount: { type: Number, default: 0 },                     // 败场数
    },
    { timestamps: true }
); // 自动加 createdAt 和 updatedAt 字段

module.exports = mongoose.model('User', UserSchema);
