var request = require('request');
var crypto = require('crypto');

module.exports = {
    getDateString: function() {
        var today = new Date();
        var day = this.prefixZero(today.getDate());
        var month = this.prefixZero(today.getMonth()+1);
        var year = today.getFullYear();
        var hour = this.prefixZero(today.getHours());
        var min = this.prefixZero(today.getMinutes());
        var sec = this.prefixZero(today.getSeconds());

        return day + '/' + month + ' ' + year + ', ' +
            hour + ':' + min + ':' + sec;
    },
    prefixZero: function(input) {
        if (input < 10) {
            return '0' + input;
        }
        return input;
    },
    request: function(url, method, token, callback) {
        var header = {
            'Authorization': 'Bearer ' + token
        };

        if (token === null && method === 'POST') {
            header = {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }

        request({
            uri: url,
            method: method,
            headers: header
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback({
                    error: null,
                    body: body
                });
            } else {
                callback({
                    error: error,
                    body: body
                });
            }
        });
    },
    captcha: function(data, callback) {
        request({
            uri: 'https://www.google.com/recaptcha/api/siteverify' +
            '?response=' + data.response +
            '&secret=' + data.secret,
            method: 'POST'
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback({
                    error: null,
                    body: body
                });
            } else {
                callback({
                    error: error,
                    body: body
                });
            }
        });
    },
    send: function(obj, res) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.send(obj);
    },
    sendError: function(obj, res) {
        if (obj === null) {
            obj = {
                msg: 'You did it wrong.'
            }
        }
        res.statusCode = 400;
        res.send(obj);
    },
    render: function(page, obj, res) {
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.render(page, obj);
    },
    hash: function(input, hostname) {
        return crypto
            .createHash('md5')
            .update(input + hostname)
            .digest('hex');
    }
};