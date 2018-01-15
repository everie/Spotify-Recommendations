var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var routes = require('./routes');
var settings = require('./settings');

var app = express();
app.use(express.static('static'));

app.set('view engine', 'ejs');
app.use(cookieParser('secret'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(routes);

app.listen(settings.port);