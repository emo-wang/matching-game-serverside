var wsManager = require('../../api/ws/wsManager');
var redisManager = require('../../public/javascripts/redisManager')



async function broadcastLobbyListUpdate(req, res, next) {
    res.on('finish', async () => {
        if ([200, 201, 204].includes(res.statusCode)) {
            try {
                console.log('触发lobby中间件')
                const allLobbies = await redisManager.getAll('lobby:*')
                wsManager.broadcast({ type: 'update-lobbies', data: Object.values(allLobbies) });
            } catch (err) {
                console.error('广播失败:', err.message);
            }
        }
    });
    next();
};


module.exports = {
    broadcastLobbyListUpdate
};
