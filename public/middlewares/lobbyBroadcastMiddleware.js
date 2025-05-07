const wsManager = require('../../api/ws/wsManager');
const redisManager = require('../../public/javascripts/redisManager');

async function broadcastLobbyListUpdate(req, res, next) {
    res.once('finish', async () => {
        if ([200, 201, 204].includes(res.statusCode)) {
            try {
                console.log('触发 lobby 更新中间件');

                const allLobbies = await redisManager.getAll('lobby:*');
                const lobbyWSS = wsManager.getWSS('lobby');

                if (lobbyWSS) {
                    wsManager.broadcast('lobby', {
                        type: 'update-lobbies',
                        data: Object.values(allLobbies)
                    });
                } else {
                    console.warn('lobby 的 WebSocket 服务不存在，无法广播');
                }
            } catch (err) {
                console.error('广播大厅列表失败:', err.message);
            }
        }
    });

    next();
}

module.exports = {
    broadcastLobbyListUpdate
};
