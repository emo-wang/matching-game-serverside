require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var wsManager = require('./api/ws/wsManager.js');
var connectDB = require('./config/db')
var redisManager = require('./public/javascripts/redisManager');
var usersRoutes = require('./api/routes/users/userRoutes');
var lobbiesRoutes = require('./api/routes/lobbies/lobbyRoutes')
var authRoutes = require('./api/routes/auth/authRoutes')
var gameRoutes = require('./api/routes/games/gameRoutes')

//创建express实例
var app = express();


// 创建ws实例（这个目前是游戏大厅再使用）
const wsLobbyServer = http.createServer(app);
const lobbywss = wsManager.setLobbyWss('lobby', wsLobbyServer);
wsLobbyServer.listen(3001, () => {
    console.log('lobbyws 服务运行于 http://localhost:3001');
});

// ws实例（目前是用于所有游戏房间）
const wsGameServer = http.createServer(app);
const gameWss = wsManager.setGameWss('game', wsGameServer)
wsGameServer.listen(4001, () => {
    console.log('gamews 服务运行于 http://localhost:4001');
})

// 初始化数据库连接
connectDB();
// 初始化redis连接
// redisManager.set('foo', 'bar');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// CORS handler
app.use(cors({
    // origin: 'http://localhost:7456',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use('/users', usersRoutes);
app.use('/lobbies', lobbiesRoutes);
app.use('/auth', authRoutes);
app.use('/game', gameRoutes)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
