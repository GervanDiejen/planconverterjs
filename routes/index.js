/*
 * Routes for the root of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var config = require("../config.js");

exports.get = function(req, res) {
    res.render('index',
        { host : config.server.host + ':' + config.server.external_port });
};

