const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// 创建Express应用
const app = express();

// 设置一个路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 创建一个HTTP服务器并将Express应用关联上
const server = http.createServer(app);

// 创建WebSocket服务器实例，关联到HTTP服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');
  ws.send('Welcome New Client!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send(`Server received: ${message}`);  // 回声服务器逻辑
  });

  ws.on('close', () => {
    console.log('Client has disconnected');
  });
});

// 启动服务器在3000端口监听
const port = 3001;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
