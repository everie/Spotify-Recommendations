var express = require('express');
var fs = require('fs');
var settings = require('./settings');
var methods = require('./methods');
var async = require('async');

var dbFile = './db/db.json';
var db = require(dbFile);

var app = express();

app.get('/', function (req, res) {
    if (!req.signedCookies.token) {
        var url = 'https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + settings.clientId +
            '&scope=' + encodeURIComponent(settings.scopeUser) +
            '&redirect_uri=' + encodeURIComponent(settings.callback) +
            '&state=' + methods.hash(settings.stateUser, req.hostname);

        res.redirect(url);
    } else {

        var url = 'https://api.spotify.com/v1/me';

        methods.request(url, 'GET', req.signedCookies.token, function(data) {
            if (data.error !== null) {
                methods.sendError(data.error, res);
            } else {
                var obj = JSON.parse(data.body);

                obj.pageTitle = settings.title;
                methods.render('pages/index', obj, res);
            }
        });
    }
});

app.get('/callback', function (req, res) {

    if (!req.query.code) {
        res.send('you did it wrong.');
    } else {
        var code = req.query.code;
        var state = req.query.state;

        if (!req.query.state) {
            res.send('you did it wrong.');
        } else {

            var token_url = 'https://accounts.spotify.com/api/token' +
                '?grant_type=authorization_code' +
                '&code=' + code +
                '&redirect_uri=' + encodeURIComponent(settings.callback) +
                '&client_id=' + settings.clientId +
                '&client_secret=' + settings.clientSecret;

            methods.request(token_url, 'POST', null, function(data) {
                if (data.error !== null) {
                    methods.sendError(data.error, res);
                } else {

                    var obj = JSON.parse(data.body);

                    var options = {
                        maxAge: 1000 * 60 * 60, // would expire after 60 minutes
                        httpOnly: true, // The cookie only accessible by the web server
                        signed: true // Indicates if the cookie should be signed
                    };

                    if (state === methods.hash(settings.stateUser, req.hostname)) {
                        res.cookie('token', obj.access_token, options);
                        res.redirect('/');
                    } else if (state === methods.hash(settings.stateAdmin, req.hostname)) {
                        res.cookie('adminToken', obj.access_token, options);
                        res.redirect('/admin');
                    }

                }
            });

        }
    }

});

app.get('/admin', function (req, res) {
    if (!req.signedCookies.adminToken) {
        var url = 'https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + settings.clientId +
            '&scope=' + encodeURIComponent(settings.scopeAdmin) +
            '&redirect_uri=' + encodeURIComponent(settings.callback) +
            '&state=' + methods.hash(settings.stateAdmin, req.hostname);

        res.redirect(url);
    } else {

        var url = 'https://api.spotify.com/v1/me';

        methods.request(url, 'GET', req.signedCookies.adminToken, function(data) {
            if (data.error !== null) {
                methods.sendError(data.error, res);
            } else {
                var obj = JSON.parse(data.body);

                if (obj.id === settings.ownerId) {
                    obj.pageTitle = settings.title;
                    methods.render('pages/admin', obj, res);
                } else {
                    methods.sendError(null, res);
                }
            }
        });
    }
});

app.post('/search', function (req, res) {
    var text = req.body.text.trim();

    if (text.length > 0) {

        var url = 'https://api.spotify.com/v1/search' +
            '?limit=10' +
            '&type=track' +
            '&q=' + encodeURIComponent(text);

        methods.request(url, 'GET', req.signedCookies.token, function(data) {
            if (data.error !== null) {
                methods.sendError(data.error, res);
            } else {
                methods.send(data.body, res);
            }
        });
    } else {
        res.send('need more data.');
    }
});

app.post('/send', function (req, res) {
    var obj = req.body;

    obj.date = methods.getDateString();
    db.tracks.unshift(obj);

    fs.writeFile(dbFile, JSON.stringify(db, null, 2), function (err) {
        if (err !== null) {
            methods.sendError(err.error, res);
        } else {
            methods.send({
                msg: 'Track is submitted. Thank you for your recommendation!'
            }, res);
        }
    });
});

app.get('/list', function (req, res) {
    methods.send(db, res);
});
app.get('/list/:id', function (req, res) {
    var tracks = [];
    for (var i = 0; i < db.tracks.length; i++) {
        var track = db.tracks[i];

        if (track.posterId === req.params.id) {
            tracks.push(track);
        }
    }

    methods.send(tracks, res);
});

app.get('/track/:id', function (req, res) {

    var url = 'https://api.spotify.com/v1/tracks/' + req.params.id;

    methods.request(url, 'GET', req.signedCookies.token, function(data) {
        if (data.error !== null) {
            methods.sendError(data.error, res);
        } else {
            methods.send(data.body, res);
        }
    });

});

app.get('/flags', function (req, res) {
    var countries = [];
    for (var i = 0; i < db.tracks.length; i++) {
        var track = db.tracks[i];

        if (countries.indexOf(track.posterCountry) < 0) {
            countries.push(track.posterCountry);
        }
    }

    var result = [];
    var url = 'https://restcountries.eu/rest/v2/alpha/';

    async.each(countries, function(country, callback) {
        var flagUrl = url + country + '?fields=flag';

        methods.request(flagUrl, 'GET', null, function (data) {
            result.push({
                code: country,
                flag: JSON.parse(data.body).flag
            });
            callback();
        });
    }, function(err) {
        if (err !== null) {
            methods.sendError(err, res);
        } else {
            methods.send(result, res);
        }
    });
});

app.get('/playlist', function (req, res) {

    var url = 'https://api.spotify.com/v1/users/' +
        settings.ownerId + '/playlists/' + settings.playlistId +
        '/tracks/?fields=items.track.id,next';

    var last = false;
    var items = [];

    async.whilst(function() {
        return last === false;
    }, function(callback) {

        methods.request(url, 'GET', req.signedCookies.adminToken, function(data) {
            var playlist = JSON.parse(data.body);

            for (var i = 0; i < playlist.items.length; i++) {
                items.push(playlist.items[i].track.id);
            }

            if (playlist.next == null) {
                last = true;
            } else {
                url = playlist.next;
            }

            callback();
        });


    }, function(err) {
        if (err !== null) {
            methods.sendError(err, res);
        } else {
            methods.send(items, res);
        }
    });

});


app.post('/add', function (req, res) {
    var uri = req.body.uri;

    var url = 'https://api.spotify.com/v1/users/' +
        settings.ownerId + '/playlists/' + settings.playlistId +
        '/tracks?uris=' + uri;

    methods.request(url, 'POST', req.signedCookies.adminToken, function(data) {
        if (data.error !== null) {
            methods.sendError(data.error, res);
        } else {
            methods.send(data.body, res);
        }
    });
});

module.exports = app;