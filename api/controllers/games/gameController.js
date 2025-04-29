var gameService = require('../../services/games/gameService');
var redisManager = require('../../../public/javascripts/redisManager')

async function enterRoom(req, res) {
    console.log(`进入房间用户id`, req.user.userId)
    try {
        const room = await gameService.enterRoom(req.body.roomId, req.user.userId);
        res.status(201).send(room);
    } catch (error) {
        res.status(400).send(error);
    }
};

async function exitRoom(req, res) {
    console.log(`退出房间用户id`, req.user.userId)
    try {
        const room = await gameService.exitRoom(req.body.roomId, req.user.userId);
        res.status(201).send(room);
    } catch (error) {
        res.status(400).send(error);
    }
};


module.exports = {
    enterRoom,
    exitRoom
}
