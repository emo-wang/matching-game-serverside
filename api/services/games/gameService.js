var User = require('../../models/users/userModel');
var redisManager = require('../../../public/javascripts/redisManager');
var wsManager = require('../../ws/wsManager')

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

    if (game.players.length !== 0) {
        await redisManager.persist(getRoomKey(roomId));
        await redisManager.persist(getGameKey(roomId));
    }

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
        gameBoard: [],
        isReady: false,
        level: user.level
    })

    // 更新room数据
    room.players.push({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        isReady: false,
        score: 0,
        level: user.level
    })

    // 如果没有房主则成为新的房主
    if (!room.owner?.userId) {
        const newOwner = {
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            level: user.level
        }
        room.owner = newOwner
        game.owner = newOwner
    }

    // console.log(room, game)

    await redisManager.set(getRoomKey(roomId), room)
    await redisManager.set(getGameKey(roomId), game)
    return { success: true };

}

async function exitRoom(roomId, userId) {
    let game = await redisManager.get(getGameKey(roomId))
    let room = await redisManager.get(getRoomKey(roomId))

    if (!game) throw new Error("RoomId Error");

    // TODO: 强行退出也可以，就是会有惩罚！
    if (game.status !== 'waiting' && game.status !== 'ended') throw new Error("Game is already started")

    game.players = game.players.filter(player => player.userId !== userId)
    room.players = room.players.filter(player => player.userId !== userId)

    // TODO: 如果房主离开房间，设置玩家列表中第一个玩家为房主
    if (game.owner.userId === userId) {
        const player = game.players[0]
        const newOwner = player ? {
            userId: player.userId,
            username: player.username,
            avatar: player.avatar,
            level: player.level
        } : {
            userId: null,
            username: null,
            avatar: null,
            level: null
        }
        game.owner = newOwner;
        room.owner = newOwner
    }

    if (game.players.length === 0) {
        const ttl = 600;

        await redisManager.expire(getRoomKey(roomId), ttl);
        await redisManager.expire(getGameKey(roomId), ttl);

        // WARNING: 设置 JS 延迟任务，服务重启不保证可靠，重度任务请用队列系统
        setTimeout(async () => {
            const latestGame = await redisManager.get(getGameKey(roomId));
            if (latestGame && latestGame.players.length === 0) {
                await redisManager.del(getRoomKey(roomId));
                await redisManager.del(getGameKey(roomId));

                const allLobbies = await redisManager.getAll('lobby:*');
                const lobbyWSS = wsManager.getWSS('lobby');

                if (lobbyWSS) {
                    wsManager.broadcast('lobby', {
                        type: 'update-lobbies',
                        data: Object.values(allLobbies)
                    });
                } else {
                    console.warn('lobby ws does not exit');
                }
            }
        }, ttl * 1000);
    }

    await redisManager.set(getRoomKey(roomId), room)
    await redisManager.set(getGameKey(roomId), game)
    return { success: true };
}

async function updateRoom(roomId, config, userId) {
    console.log(roomId, config)
    // 判断房间是否存在
    if (!roomId) {
        throw new Error('Invalid roomId')
    }

    let gameData = await redisManager.get(getGameKey(roomId))
    let roomData = await redisManager.get(getRoomKey(roomId))

    if (!gameData || !roomData) {
        throw new Error('Room not found in Redis')
    }
    
    // 判断用户是否为房主
    if (userId !== roomData.owner.userId) {
        throw new Error('You are not the owner of this room')
    }

    // 判断参数传了没
    // const { maxPlayers, mapType } = config;
    // if (!mapType || !maxPlayers) {
    //     throw new Error('Invalid config')
    // }

    // 尝试赋值
    const updateGameRes = await redisManager.safeUpdate(getGameKey(roomId), (game) => { game.config = config })
    if (!(updateGameRes).success) {
        throw new Error('UpdateGame failed')
    }
    const updateRoomRes = await redisManager.safeUpdate(getRoomKey(roomId), (game) => { game.config = config })
    if (!(updateRoomRes).success) {
        throw new Error('UpdateRoom failed')
    }

    // 广播
    wsManager.broadcast('game', { type: 'update-config', message: `success`, data: config }, roomId);

    return { success: true };

}


module.exports = {
    enterRoom,
    exitRoom,
    updateRoom
};
