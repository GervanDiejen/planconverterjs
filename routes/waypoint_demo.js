/*
 * Routes for the root of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var config = require("../config.js");

exports.get = function(req, res) {
    res.render('waypoint_demo', { host : config.server.host });
};

