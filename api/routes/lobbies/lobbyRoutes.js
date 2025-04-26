const express = require('express');
const router = express.Router();
const lobbyController = require('../../controllers/lobbies/lobbyController');
const { broadcastLobbyListUpdate } = require('../../../public/middlewares/lobbyBroadcastMiddleware')
const { authMiddleware } = require('../../../public/middlewares/authMiddleware');

router.post('/', authMiddleware, broadcastLobbyListUpdate, lobbyController.createLobby);
router.get('/', lobbyController.getAllLobbies);
router.get('/:id', lobbyController.getLobby);
router.put('/:id', authMiddleware, broadcastLobbyListUpdate, lobbyController.updateLobby);
router.delete('/:id', authMiddleware, broadcastLobbyListUpdate, lobbyController.deleteLobby);
// for test
router.delete('/', broadcastLobbyListUpdate, lobbyController.deleteAllLobbies)

module.exports = router;
