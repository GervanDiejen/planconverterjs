/*
 * Routes for /jsontopln of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var fs = require('fs'),
    exec = require('child_process').exec,
    config = require('../config.js');

/*
 * POST to /jsontopln
 */
exports.post = function(req, res, next) {
    var cmd = config.jsontopln_command;
    if (req.body.fs == 'fs9')
        cmd += " --fs9";
    else if (req.body.fs == 'fsx')
        cmd += " --fsx";
    var child = exec(cmd,
            {
                encoding : 'utf-8',
                stdio : ['pipe','pipe','inherit']
            },
            function(err, stdout, stderr) {
                if (err !== null) {
                    console.log('post processor returned ' + err.code);
                    next(new Error('unable to parse file'));
                } else {
                    res.attachment(req.body.fn);
                    res.send(stdout);
                }
            });
    child.stdin.end(req.body.fp);
};
