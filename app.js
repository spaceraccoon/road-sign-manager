var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var axios = require('axios');

var index = require('./routes/index');
var users = require('./routes/users');
var messageManual = require('./routes/messageManual')
var messageText = require('./routes/messageText')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/message/manual', messageManual);
app.use('/message/text', messageText);

app.post('/', function(req, res, next) {
  console.log(req.body);
  axios.post('https://morning-caverns-74081.herokuapp.com/message', {
    'message': req.body.manual
  });
  res.render('index');
});

//Receive on POST and console logs message (for /message/text)
app.post('/message/text', function(req, res) {
  console.log(req.body.message);
  res.render('messageText');
});

//Receive on POST and send message to traffic sign (for /message/manual)
app.post('/message/manual', function(req, res, next) {
  console.log(req.body.message);
  axios.post('https://morning-caverns-74081.herokuapp.com/message', {
    'message': req.body.message
  })
  res.render('messageManual')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
