var lobbyService = require('../../services/lobbies/lobbyService');
var redisManager = require('../../../public/javascripts/redisManager')

function getRoomKey(id) { return `lobby:${id}` }
function getGameKey(id) { return `game:${id}` }

async function createLobby(req, res) {
    const currentUserId = req.user.userId; // 从 token 拿的 id
    try {
        const lobby = await lobbyService.createLobby(req.body, currentUserId);
        res.status(201).send(lobby);
    } catch (error) {
        res.status(401).send({ message: error.message });
    }
};

async function getAllLobbies(req, res) {
    try {
        const lobbies = await lobbyService.getAllLobbies();
        res.status(200).send(lobbies);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

async function getLobby(req, res) {
    try {
        const lobby = await lobbyService.getLobby(req.params.id);
        if (!lobby) {
            res.status(404).send({ message: 'Room unfounded!' });
            return
        }
        res.status(200).send(lobby);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

async function updateLobby(req, res) {
    const id = req.body.owner.userId;  // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).send({ message: 'You are not the room owner!' });
    }

    try {
        const lobby = await lobbyService.updateLobby(req.params.id, req.body);
        if (!lobby) {
            return res.status(404).send({ message: 'Room unfounded!' });
        }
        res.status(201).send(lobby);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

async function deleteLobby(req, res) {
    const lobby = await redisManager.get(getRoomKey(req.params.id));
    const id = lobby.owner.userId;  // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).send({ message: 'You are not the room owner!' });
    }

    try {
        const lobby = await lobbyService.deleteLobby(req.params.id);
        if (!lobby) {
            return res.status(404).send({ message: 'Lobby unfounded!' });
        }
        res.status(200).send({ message: 'Lobby deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

async function deleteAllLobbies(req, res) {
    try {
        const lobby = await lobbyService.deleteAllLobbies();
        if (!lobby) {
            return res.status(404).send({ message: 'Lobby unfounded!' });
        }
        res.status(200).send({ message: 'All lobbies deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports = {
    createLobby,
    getAllLobbies,
    getLobby,
    updateLobby,
    deleteLobby,
    deleteAllLobbies,
}
