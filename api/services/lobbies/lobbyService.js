const Lobby = require('../../models/lobbies/lobbyModel');

async function createLobby(lobbyData) {
    const lobby = new Lobby(lobbyData);
    return await lobby.save();
};

async function getAllLobbies() {
    return await Lobby.find({});
};

async function getLobby(id) {
    return await Lobby.findById(id);
};

async function updateLobby(id, lobbyData) {
    return await Lobby.findByIdAndUpdate(id, lobbyData, { new: true });
};

async function deleteLobby(id) {
    return await Lobby.findByIdAndDelete(id);
};

module.exports = {
    createLobby,
    getAllLobbies,
    getLobby,
    updateLobby,
    deleteLobby
}
