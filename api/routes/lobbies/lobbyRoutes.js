const express = require('express');
const router = express.Router();
const lobbyController = require('../../controllers/lobbies/lobbyController');

router.post('/', lobbyController.createLobby);
router.get('/', lobbyController.getAllLobbies);
router.get('/:id', lobbyController.getLobby);
router.put('/:id', lobbyController.updateLobby);
router.delete('/:id', lobbyController.deleteLobby);
router.delete('/',lobbyController.deleteAllLobbies)

module.exports = router;
