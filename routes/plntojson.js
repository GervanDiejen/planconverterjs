/*
 * Routes for /pln2json of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var fs = require('fs'),
    exec = require('child_process').exec,
    config = require('../config.js');

/*
 * POST to /plntojson
 */
exports.post = function(req, res, next) {
    var child = exec(config.command_name + " " + req.files.f.path,
            {
                encoding : 'utf-8',
                stdio : ['pipe','pipe','inherit']
            },
            function(err, stdout) {
                fs.unlink(req.files.f.path, function(err) {
                    if (err) {
                        console.log("ERROR: failed to unlink file %s", req.files.f.path);
                    }
                });
                if (err !== null) {
                    console.log('post processor returned ' + err.code);
                    next(new Error('unable to parse file'));
                } else {
                    res.send(JSON.parse(stdout));
                }
            });
};
