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

                // console.log(`[${key}] 收到roomId:`, payload.data.roomId);
                const roomId = payload.data.roomId
                const userId = payload?.data?.userId
                let newGameData = await redisManager.get(getGameKey(roomId))
                let newRoomData = await redisManager.get(getRoomKey(roomId))

                // TODO: 防作弊
                switch (payload.type) {
                    case `enter-room`:
                        // 用户进入房间之后，客户端连接上gamews收到welcome消息之后，客户端发送enter-room以挂载roomId
                        // 注意：这个ws不是wss，是每个独立的客户端和服务端的连接。
                        ws.roomId = payload.data.roomId
                        ws.userId = payload.data.userId
                        // 1. 其他用户进入房间时广播。2. 自己进入房间时广播获取游戏数据
                        if (newGameData.status === GAMESTATUS.WAITING) {
                            module.exports.broadcast('game', { type: 'enter-room', message: `success`, data: newRoomData }, roomId);
                            module.exports.broadcast('lobby', { type: 'enter-room', message: `success`, data: newRoomData });
                            break;
                        }
                        break;

                    // 用户准备或取消准备
                    // TDOO: 优化，玩家进入房间、退出房间、准备或者取消准备，都不需要把整个游戏数据发一遍
                    case `player-ready`:
                        if (newGameData.status === GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        const { isReady } = payload.data
                        if (!userId) {
                            console.log('data error');
                            break;
                        }
                        newGameData.players.forEach((player) => {
                            if (player.userId === userId) {
                                player.isReady = isReady
                            }
                        })
                        redisManager.set(getGameKey(roomId), newGameData)
                        module.exports.broadcast('game', { type: 'player-ready', message: `success`, data: newGameData }, roomId);
                        break;

                    // 开始游戏
                    case `start-game`:
                        if (newGameData.status === GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }

                        if (newGameData.players.some(p => !p.isReady)) {
                            console.log('not all users are ready')
                            break;
                        }
                        newGameData.status = GAMESTATUS.PLAYING
                        newRoomData.status = GAMESTATUS.PLAYING
                        // init game board
                        const gameBoard = initGameBoardData(0)
                        newGameData.players.forEach((player) => {
                            player.gameBoard = gameBoard
                        })

                        redisManager.set(getGameKey(roomId), newGameData)
                        redisManager.set(getRoomKey(roomId), newRoomData)
                        module.exports.broadcast('game', { type: 'start-game', message: `success`, data: newGameData }, roomId);
                        module.exports.broadcast('lobby', { type: 'start-game', message: `success`, data: newRoomData });
                        break;

                    // 游戏开始后更新状态
                    case 'update-game':
                        if (newGameData.status !== GAMESTATUS.PLAYING) {
                            console.log('wrong game status');
                            break;
                        }
                        const { eliminatedNode: pArr, isEnded } = payload.data // 每次消除都是一对
                        if (!userId || !pArr) {
                            console.log('data error');
                            break;
                        }
                        // console.log(pArr, userId)
                        newGameData.players.forEach((player) => {
                            if (player.userId === userId) {
                                for (let i = 0; i < pArr.length; i++) {
                                    const [x, y] = pArr[i]
                                    player.gameBoard[x][y] = -1
                                }
                            }
                        })

                        if (isEnded) {
                            newGameData.status = GAMESTATUS.ENDED
                            newRoomData.status = GAMESTATUS.ENDED
                            redisManager.set(getRoomKey(roomId), newRoomData)
                            module.exports.broadcast('lobby', { type: 'end-game', message: `success`, data: newRoomData });
                        }
                        redisManager.set(getGameKey(roomId), newGameData);
                        module.exports.broadcast('game', { type: 'update-game', message: 'success', data: { pArr, userId, isEnded } }, roomId);
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

            ws.on('close', async () => {
                console.log(`[${key}] 客户端断开连接`, ws);
                const { userId, roomId } = ws
                console.log(userId, roomId)

                let newGameData = await redisManager.get(getGameKey(roomId))
                let newRoomData = await redisManager.get(getRoomKey(roomId))

                if (!newGameData || !newGameData.players.some(p => p.userId === userId)) return;
                // 用户异常退出
                // 逻辑和gameService.exitRoom相似
                newGameData.players = newGameData.players.filter(player => player.userId !== userId)
                newRoomData.players = newRoomData.players.filter(player => player.userId !== userId)

                redisManager.set(getGameKey(roomId), newGameData)
                redisManager.set(getRoomKey(roomId), newRoomData)
                module.exports.broadcast('game', { type: 'player-exit', message: `success`, data: newGameData }, roomId);
                module.exports.broadcast('lobby', { type: 'player-exit', message: `success`, data: newRoomData });

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