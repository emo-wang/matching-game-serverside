var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var connectDB = require('./config/db')
var { redisClient } = require('./config/redisClient.js');
var usersRoutes = require('./api/routes/users/userRoutes');
var lobbiesRoutes = require('./api/routes/lobbies/lobbyRoutes')

// 初始化websocket连接
import('./api/ws/gameWs.js')

// 初始化数据库连接
connectDB();
// 初始化redis连接
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();


//创建express实例
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// CORS handler
// app.use(cors());

app.use(cors({
    origin: 'http://localhost:7456',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/users', usersRoutes);
app.use('/lobbies', lobbiesRoutes);


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
