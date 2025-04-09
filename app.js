var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// DB
var connectDB = require('./config/db')
var client = import('./config/redisclient.js'); // 引入 Redis 客户端

// var indexRouter = require('./api/routes/index');
var usersRoutes = require('./api/routes/users/userRoutes');
// 房间信息可能还是得写入redis
// var lobbiesRoutes = require('./api/routes/lobbies/lobbyRoutes')

connectDB(); // 初始化数据库连接
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRoutes);
// app.use('/lobbies', lobbiesRoutes);

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
