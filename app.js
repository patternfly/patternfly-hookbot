const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');
const hooksRouter = require('./routes/hooks');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/hooks', hooksRouter);

module.exports = app;
