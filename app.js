const express = require('express');
const favicon = require('serve-favicon');
const robots = require('express-robots');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const basicAuth = require('express-basic-auth');
const helmet = require('helmet');

require('dotenv').config();

const index = require('./routes/index');
const message = require('./routes/message');
const settings = require('./routes/settings');
const { Sign } = require('./models');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app locals
app.locals.currentMode = 0;
app.locals.dataInterval = null;

// HTTP header security
app.use(helmet());

// authentication
app.use(
  basicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true,
  }),
);

// favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

// robots - no index
app.use(robots({ UserAgent: '*', Disallow: '/' }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// pass signs to all message routes
app.use('/message', async (req, res, next) => {
  res.locals.signs = await Sign.findAll({
    raw: true,
    order: [['name', 'ASC']],
  });
  next();
});
app.use('/message', message);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// pass mode to all views
app.use((req, res, next) => {
  res.locals.currentMode = req.app.locals.currentMode;
  next();
});

module.exports = app;
