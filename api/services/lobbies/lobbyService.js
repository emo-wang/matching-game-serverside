var Lobby = require('../../models/lobbies/lobbyModel');
var User = require('../../models/users/userModel');
var Game = require('../../models/games/gameModel');
var redisManager = require('../../../public/javascripts/redisManager');

function getGameKey(id) { return `game:${id}` }
function getRoomKey(id) { return `lobby:${id}` }

async function createLobby(roomData, ownerId) {
    let owner = await User.findById(ownerId).select('-password')

    // 创建room
    let room = new Lobby(roomData).toObject();
    room.ownerId = ownerId
    room.players.push({
        userId: owner._id,
        nickname: owner.nickname,
        avatar: owner.avatar,
        isReady: false,
        score: 0
    })

    // 创建game
    let game = new Game({ ownerId, ...roomData }).toObject()
    game.players.push({
        userId: owner._id,
        nickname: owner.nickname,
        score: 0,
        online: true,
        lastMoveAt: new Date(),
        gameBoard: []
    })

    await redisManager.set(getGameKey(room._id), game);
    await redisManager.set(getRoomKey(room._id), room);
    return room;
}

async function getAllLobbies() {
    const res = await redisManager.getAll('lobby:*'); // 只拿 lobby 相关的
    return Object.values(res);
}

async function getLobby(id) {
    return await redisManager.get(getRoomKey(id));
}

async function updateLobby(id, lobbyData) {
    await redisManager.set(getRoomKey(id), lobbyData);
    return lobbyData;
}

async function deleteLobby(id) {
    await redisManager.del(getRoomKey(id));
    await redisManager.del(getGameKey(id))
    return { success: true };

}

async function deleteAllLobbies() {
    await redisManager.delAll('game:*')
    await redisManager.delAll('lobby:*');
    return { success: true };

}

module.exports = {
    createLobby,
    getAllLobbies,
    getLobby,
    updateLobby,
    deleteLobby,
    deleteAllLobbies
};
