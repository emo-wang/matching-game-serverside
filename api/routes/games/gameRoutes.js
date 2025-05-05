const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/games/gameController');
const { broadcastGameUpdate } = require('../../../public/middlewares/gameBroadcastMiddleware')
const { broadcastLobbyListUpdate } = require('../../../public/middlewares/lobbyBroadcastMiddleware')
const { authMiddleware } = require('../../../public/middlewares/authMiddleware');

router.post('/enter', authMiddleware, broadcastLobbyListUpdate, gameController.enterRoom);
router.post('/exit', authMiddleware, broadcastLobbyListUpdate, broadcastGameUpdate, gameController.exitRoom);
// router.post('/gamestart/:id', authMiddleware, broadcastLobbyListUpdate, roomController.startGame)

module.exports = router;
