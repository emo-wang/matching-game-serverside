var Lobby = require('../../models/lobbies/lobbyModel');
var redisManager = require('../../../public/javascripts/redisManager');

// 帮你统一封装一下 Key生成器
function getLobbyKey(id) {
    return `lobby:${id}`;
}

async function createLobby(lobbyData) {
    const lobby = new Lobby(lobbyData);
    await redisManager.set(getLobbyKey(lobby._id), lobby.toObject());
    return lobby;
}

async function getAllLobbies() {
    const res = await redisManager.getAll('lobby:*'); // 只拿 lobby 相关的
    return Object.values(res);
}

async function getLobby(id) {
    return await redisManager.get(getLobbyKey(id));
}

async function updateLobby(id, lobbyData) {
    await redisManager.set(getLobbyKey(id), lobbyData);
    return lobbyData;
}

async function deleteLobby(id) {
    await redisManager.del(getLobbyKey(id));
    return "ok";
}

async function deleteAllLobbies() {
    await redisManager.delAll('lobby:*');
    return "ok";
}

module.exports = {
    createLobby,
    getAllLobbies,
    getLobby,
    updateLobby,
    deleteLobby,
    deleteAllLobbies
};
