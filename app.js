var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var hooksRouter = require('./routes/hooks');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/hooks', hooksRouter);

module.exports = app;
