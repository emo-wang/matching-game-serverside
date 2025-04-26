var WebSocket = require('ws');
var Lobby = require('../models/lobbies/lobbyModel')
let wss = null;

module.exports = {
    setWSS: (server) => {
        wss = new WebSocket.Server({ server });

        wss.on('connection', (ws, req) => {
            console.log('新客户端已连接');

            ws.send(JSON.stringify({ type: 'welcome', message: '欢迎连接 WebSocket 服务' }));

            ws.on('message', (message) => {
                console.log('收到消息:', message);
                module.exports.broadcast({ type: 'echo', message: message.toString() });
            });

            ws.on('close', () => {
                console.log('客户端断开连接');
            });

            ws.on('error', (err) => {
                console.error('客户端错误:', err);
            });
        });

        return wss;
    },

    getWSS: () => wss,

    broadcast: (data) => {
        const msg = JSON.stringify(data);
        wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    },

    LobbyRoomsUpdate: (data) => {

    }
};
