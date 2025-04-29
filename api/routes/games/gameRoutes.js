const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/games/gameController');
const { broadcastLobbyListUpdate } = require('../../../public/middlewares/lobbyBroadcastMiddleware')
const { authMiddleware } = require('../../../public/middlewares/authMiddleware');

router.post('/enter', authMiddleware, gameController.enterRoom);
router.post('/exit', authMiddleware, gameController.exitRoom);
// router.post('/gamestart/:id', authMiddleware, broadcastLobbyListUpdate, roomController.startGame)

module.exports = router;
