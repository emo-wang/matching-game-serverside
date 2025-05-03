var WebSocket = require('ws');
var redisManager = require('../../public/javascripts/redisManager')
var { initGameBoardData } = require('../../public/javascripts/initGameBoard')


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
        // for test
        // const testArr = initGameBoardData(0)

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

                if (!payload?.data?.roomId) {
                    console.log('roomId is null')
                    throw new Error("roomId is null");
                }

                console.log(`[${key}] 收到roomId:`, payload.data.roomId);
                const roomId = payload.data.roomId
                let newGameData = await redisManager.get(getGameKey(roomId))
                let newRoomData = await redisManager.get(getRoomKey(roomId))

                // TODO: 防作弊
                switch (payload.type) {
                    // TODO: 进入房间，如果游戏已经开始，则只能观战
                    case `enter-room`:
                        // 挂载房间号，用于broadcast
                        ws.roomId = payload.data.roomId
                        if (newGameData.status === GAMESTATUS.PLAYING) {
                            module.exports.broadcast('game', { type: 'enter-room', message: `success`, data: newGameData }, roomId);
                            module.exports.broadcast('lobby', { type: 'enter-room', message: `success`, data: newRoomData });
                            break;
                        }
                        break;

                    // 选择开始游戏
                    case `start-game`:
                        if (newGameData.status === GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        newGameData.status = GAMESTATUS.PLAYING
                        newRoomData.status = GAMESTATUS.PLAYING
                        // init game board
                        // TODO: 优化
                        const gameBoard = initGameBoardData(0)
                        newGameData.players.forEach((player) => {
                            player.gameBoard = gameBoard
                        })

                        redisManager.set(getGameKey(roomId), newGameData)
                        redisManager.set(getRoomKey(roomId), newRoomData)
                        module.exports.broadcast('game', { type: 'start-game', message: `success`, data: newGameData }, roomId);
                        module.exports.broadcast('lobby', { type: 'start-game', message: `success`, data: newRoomData });
                        break;

                    case 'update-game':
                        if (newGameData.status !== GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        const { eliminatedNode: pArr, userId } = payload.data // 每次消除都是一对
                        console.log(pArr, userId)
                        newGameData.players.forEach((player) => {
                            if (player.userId === userId) {
                                for (let i = 0; i < pArr.length; i++) {
                                    const [x, y] = pArr[i]
                                    player.gameBoard[x][y] = -1
                                }
                            }
                        })
                        redisManager.set(getGameKey(roomId), newGameData);
                        module.exports.broadcast('game', { type: 'update-game', message: 'success', data: { pArr, userId } }, roomId);

                        // 更新其他用户
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
                        module.exports.broadcast('game', { type: 'pause-game', message: `success`, data: newGameData }, roomId);
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
                        module.exports.broadcast('game', { type: 'end-game', message: `success`, data: newGameData }, roomId);
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
    broadcast: (key, data, roomId = null) => {
        const wss = wssMap.get(key);
        if (!wss) {
            console.warn(`No WSS found for key '${key}'`);
            return;
        }

        const msg = JSON.stringify(data);

        wss.clients.forEach((client) => {
            const match = client.readyState === WebSocket.OPEN &&
                (!roomId || client.roomId === roomId); //如果 roomId 匹配，或不传默认全发

            if (match) {
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