var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var healthRouter = require('./routes/health');
var eventsRouter = require('./routes/events');
var organizationsRouter = require('./routes/organizations');
var volunteersRouter = require('./routes/volunteers');
var paymentsRouter = require('./routes/payments');
var moderationRouter = require('./routes/moderation');
var adminRouter = require('./routes/admin');
var organizerRouter = require('./routes/organizer');

var app = express();

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files (production build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.use('/', indexRouter);
app.use('/api/v1', healthRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', eventsRouter);
app.use('/api/v1', organizationsRouter);
app.use('/api/v1', volunteersRouter);
app.use('/api/v1', paymentsRouter);
app.use('/api/v1', moderationRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', organizerRouter);


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
  res.json({
    message: err.message,
  });
});

module.exports = app;
