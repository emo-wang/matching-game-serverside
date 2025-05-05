const wsManager = require('../../api/ws/wsManager');
const redisManager = require('../../public/javascripts/redisManager');

function getGameKey(id) { return `game:${id}` }

async function broadcastGameUpdate(req, res, next) {
    res.once('finish', async () => {
        if ([200, 201, 204].includes(res.statusCode)) {
            const roomId = res.locals.roomId; //拿到之前塞进去的

            const gameWss = wsManager.getWSS('game');
            if (!roomId || !gameWss) {
                console.warn('Wss or roomId error');
                return;
            }

            try {
                const gameData = await redisManager.get(getGameKey(roomId));
                wsManager.broadcast('game', { type: 'player-exit', data: gameData }, roomId);
            } catch (err) {
                console.error('Broadcast failed:', err.message);
            }
        }
    });

    next();
}


module.exports = {
    broadcastGameUpdate
};
