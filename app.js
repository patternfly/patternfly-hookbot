const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const hooksRouter = require('./routes/hooks');

const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/hooks', hooksRouter);

module.exports = app;
