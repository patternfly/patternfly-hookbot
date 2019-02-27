const express = require('express');
const path = require('path');
const exec = require('child_process').execSync

const indexRouter = require('./routes/index');
const hooksRouter = require('./routes/hooks');

exec(`git config --global user.email ${process.env.GIT_EMAIL}`);
exec(`git config --global user.name ${process.env.GIT_USERNAME}`);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/hooks', hooksRouter);

module.exports = app;
