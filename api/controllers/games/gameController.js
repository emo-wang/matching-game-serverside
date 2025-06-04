var gameService = require('../../services/games/gameService');

async function enterRoom(req, res) {
    // console.log(`进入房间用户id`, req.user.userId)
    try {
        const room = await gameService.enterRoom(req.body.roomId, req.user.userId);
        res.status(201).send(room);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
};

async function exitRoom(req, res) {
    // console.log(`退出房间用户id`, req.user.userId)
    try {
        const room = await gameService.exitRoom(req.body.roomId, req.user.userId);

        // 把 roomId 暂存到 res.locals，让后面的中间件能访问
        res.locals.roomId = req.body.roomId;
        res.status(201).send(room);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

async function updateRoom(req, res) {
    // console.log(`更新房间用户id`, req.user.userId)
    try {
        const room = await gameService.updateRoom(req.body.roomId, req.body.config, req.user.userId);
        res.status(201).send(room);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};


module.exports = {
    enterRoom,
    exitRoom,
    updateRoom
}
