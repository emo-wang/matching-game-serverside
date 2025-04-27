const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/rooms/roomController');
const { broadcastLobbyListUpdate } = require('../../../public/middlewares/lobbyBroadcastMiddleware')
const { authMiddleware } = require('../../../public/middlewares/authMiddleware');

router.post('/enter/:id', authMiddleware, broadcastLobbyListUpdate, roomController.enterRoom);
router.post('/exit/:id', authMiddleware, broadcastLobbyListUpdate, roomController.exitRoom);
// router.post('/gamestart/:id', authMiddleware, broadcastLobbyListUpdate, roomController.startGame)

module.exports = router;
