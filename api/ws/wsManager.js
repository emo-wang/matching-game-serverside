var WebSocket = require('ws');
var redisManager = require('../../public/javascripts/redisManager')

function getRoomKey(id) { return `lobby:${id}` }
function getGameKey(id) { return `game:${id}` }

const GAMESTATUS = {
    WAITING: 'waiting',
    PAUSE: 'pause',
    PLAYING: 'playing',
    ENDED: 'ended',
}

// 用来存不同 key 对应的 wss 实例
var wssMap = new Map();

module.exports = {
    /**
     * 创建并绑定一个新的 WebSocket.Server 到指定的 HTTP server
     * @param {string} key - 标识符，比如 'lobby' 或 'game'
     * @param {http.Server} server - HTTP Server 实例
     */
    setLobbyWss: (key, server) => {
        if (wssMap.has(key)) {
            throw new Error(`WSS with key '${key}' already exists.`);
        }

        const wss = new WebSocket.Server({ server });

        wss.on('connection', (ws, req) => {
            console.log(`[${key}] 新客户端连接`);

            ws.send(JSON.stringify({ type: 'welcome', message: `欢迎连接 ${key} WebSocket 服务` }));

            ws.on('message', (message) => {
                let payload;
                try {
                    payload = JSON.parse(message.toString());
                } catch (err) {
                    console.warn(`[${key}] 消息格式错误`, err);
                    return;
                }

                console.log(`[${key}] 收到消息对象:`, payload);
                module.exports.broadcast(key, { type: 'echo', message: payload });
            });


            ws.on('close', () => {
                console.log(`[${key}] 客户端断开连接`);
            });

            ws.on('error', (err) => {
                console.error(`[${key}] 客户端错误:`, err);
            });
        });

        wssMap.set(key, wss);

        return wss;
    },

    // key: game
    setGameWss: (key, server) => {
        if (wssMap.has(key)) {
            throw new Error(`WSS with key '${key}' already exists.`);
        }

        const wss = new WebSocket.Server({ server });

        wss.on('connection', (ws, req) => {
            console.log(`[${key}] 新客户端连接`);

            ws.send(JSON.stringify({ type: 'welcome', message: `欢迎连接 ${key} WebSocket 服务` }));

            ws.on('message', async (message) => {
                let payload;
                try {
                    payload = JSON.parse(message.toString());
                } catch (err) {
                    console.warn(`[${key}] 消息格式错误`, err);
                    return;
                }

                console.log(`[${key}] 收到消息对象:`, payload);

                if (!payload?.data?.roomId) {
                    console.log('roomId is null')
                    return
                }
                const roomId = payload.data.roomId
                console.log(`roomId`, roomId)
                let newGameData = await redisManager.get(getGameKey(roomId))
                let newRoomData = await redisManager.get(getRoomKey(roomId))

                // TODO: 将来可能需要一些防作弊系统
                switch (payload.type) {
                    case `welcome`:
                        module.exports.broadcast(key, { type: 'welcome', message: payload });
                        break;
                    // 选择开始游戏
                    case `start-game`:
                        if (newGameData.status === GAMESTATUS.PLAYING || newGameData.status === GAMESTATUS.ENDED) {
                            console.log('wrong game status');
                            break;
                        }
                        newGameData.status = GAMESTATUS.PLAYING
                        newRoomData.status = GAMESTATUS.PLAYING
                        redisManager.set(getGameKey(roomId), newGameData)
                        redisManager.set(getRoomKey(roomId), newRoomData)
                        module.exports.broadcast('game', { type: 'start-game', message: `success`, data: newGameData });
                        module.exports.broadcast('lobby', { type: 'start-game', message: `success`, data: newRoomData });
                        break;
                    // 游戏暂停
                    case 'pause-game':
                        if (newGameData.status !== GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        newGameData.status = GAMESTATUS.PAUSE
                        newRoomData.status = GAMESTATUS.PAUSE
                        redisManager.set(getGameKey(roomId), newGameData)
                        redisManager.set(getRoomKey(roomId), newRoomData)
                        module.exports.broadcast('game', { type: 'pause-game', message: `success`, data: newGameData });
                        module.exports.broadcast('lobby', { type: 'pause-game', message: `success`, data: newRoomData });
                        break;
                    // 结束游戏
                    case 'end-game':
                        if (newGameData.status !== GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        newGameData.status = GAMESTATUS.ENDED
                        newRoomData.status = GAMESTATUS.ENDED
                        redisManager.set(getGameKey(roomId), newGameData)
                        redisManager.set(getRoomKey(roomId), newRoomData)
                        module.exports.broadcast('game', { type: 'end-game', message: `success`, data: newGameData });
                        module.exports.broadcast('lobby', { type: 'end-game', message: `success`, data: newRoomData });
                        break;

                    default:
                        break;
                }

            });


            ws.on('close', () => {
                console.log(`[${key}] 客户端断开连接`);
            });

            ws.on('error', (err) => {
                console.error(`[${key}] 客户端错误:`, err);
            });
        });

        wssMap.set(key, wss);

        return wss;
    },

    /**
     * 获取某个 key 对应的 wss 实例
     * @param {string} key
     */
    getWSS: (key) => {
        return wssMap.get(key);
    },

    /**
     * 向特定 key 的所有连接广播消息
     * @param {string} key
     * @param {object} data
     */
    broadcast: (key, data) => {
        const wss = wssMap.get(key);
        if (!wss) {
            console.warn(`No WSS found for key '${key}'`);
            return;
        }

        const msg = JSON.stringify(data);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    },

    /**
     * 关闭并删除某个 WSS
     * @param {string} key
     */
    closeWSS: (key) => {
        const wss = wssMap.get(key);
        if (wss) {
            wss.close();
            wssMap.delete(key);
            console.log(`WSS with key '${key}' closed and removed.`);
        }
    },

    /**
     * 列出当前所有 wss
     */
    listKeys: () => {
        return Array.from(wssMap.keys());
    }
};