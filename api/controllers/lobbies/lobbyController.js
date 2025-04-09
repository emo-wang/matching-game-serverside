const lobbyService = require('../../services/lobbies/lobbyService');

async function createLobby(req, res) {
    try {
        const lobby = await lobbyService.createLobby(req.body);
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

module.exports = {
    createLobby,
    getAllLobbies,
    getLobby,
    updateLobby,
    deleteLobby,
}
