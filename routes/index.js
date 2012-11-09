/*
 * Routes for the root of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

exports.get = function(req, res) {
    res.render('index');
};

