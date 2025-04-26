var lobbyService = require('../../services/lobbies/lobbyService');
var Lobby = require('../../models/lobbies/lobbyModel');
// var { redisClient } = require('../../../config/redisclient.js');

async function createLobby(req, res) {
    try {
        const lobby = await lobbyService.createLobby(req.body);
        // await redisClient.set('hello', 'world')
        res.status(201).send(lobby);
    } catch (error) {
        res.status(400).send(error);
    }
};

async function getAllLobbies(req, res) {
    try {
        const lobbies = await lobbyService.getAllLobbies();
        res.status(200).send(lobbies);
    } catch (error) {
        res.status(500).send(error);
    }
};

async function getLobby(req, res) {
    try {
        const lobby = await lobbyService.getLobby(req.params.id);
        if (!lobby) {
            return res.status(404).send();
        }
        res.status(200).send(lobby);
    } catch (error) {
        res.status(500).send(error);
    }
};

async function updateLobby(req, res) {
    const id = req.body.roomOwner._id;  // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).json({ message: '您不是房主' });
    }

    try {
        const lobby = await lobbyService.updateLobby(req.params.id, req.body);
        if (!lobby) {
            return res.status(404).send();
        }
        res.send(lobby);
    } catch (error) {
        res.status(400).send(error);
    }
};

async function deleteLobby(req, res) {
    const lobby = await Lobby.findById(req.params.id);
    const id = lobby.roomOwner._id;  // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).json({ message: '您不是房主' });
    }

    try {
        const lobby = await lobbyService.deleteLobby(req.params.id);
        if (!lobby) {
            return res.status(404).send();
        }
        res.status(200).send({ message: 'Lobby deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};

async function deleteAllLobbies(req, res) {
    try {
        const lobby = await lobbyService.deleteAllLobbies();
        if (!lobby) {
            return res.status(404).send();
        }
        res.status(200).send({ message: 'All lobbies deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
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
