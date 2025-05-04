var User = require('../../models/users/userModel');
var redisManager = require('../../../public/javascripts/redisManager');

function getGameKey(id) { return `game:${id}` }
function getRoomKey(id) { return `lobby:${id}` }

// 进入房间时至少有一个人，创建房间的房主会自动加入房间
async function enterRoom(roomId, userId) {
    let game = await redisManager.get(getGameKey(roomId))
    let room = await redisManager.get(getRoomKey(roomId))
    let user = await User.findById(userId).select('-password')
    // user._id是objectID

    if (!game) throw new Error("RoomId Error");

    if (game.status !== 'waiting') throw new Error("Game is already started or ended")

    if (game.players.length >= room.maxPlayers) throw new Error("Current room is full")

    game.players.forEach(player => {
        if (player.userId === userId) {
            throw new Error("You are already in the room!")
        }
    });

    // 更新game数据
    game.players.push({
        userId: user._id,
        username: user.username,
        score: 0,
        online: true,
        lastMoveAt: new Date(),
        gameBoard: []
    })

    // 更新room数据
    room.players.push({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        isReady: false,
        score: 0
    })

    // console.log(room, game)

    await redisManager.set(getRoomKey(roomId), room)
    await redisManager.set(getGameKey(roomId), game)
    return { success: true };

}

async function exitRoom(roomId, userId) {
    let game = await redisManager.get(getGameKey(roomId))
    let room = await redisManager.get(getRoomKey(roomId))
    let user = await User.findById(userId).select('-password')
    // user._id是objectID

    if (!game) throw new Error("RoomId Error");

    // TODO: 强行退出也可以，就是会有惩罚！
    if (game.status !== 'waiting' && game.status!=='ended') throw new Error("Game is already started")

    // 更新game数据
    game.players = game.players.filter(player => player.userId !== userId)

    // 更新room数据
    room.players = room.players.filter(player => player.userId !== userId)
    // console.log(room, game)

    // TODO: 如果当前玩家为0，删除房间

    await redisManager.set(getRoomKey(roomId), room)
    await redisManager.set(getGameKey(roomId), game)
    return { success: true };
}


module.exports = {
    enterRoom,
    exitRoom,
};
