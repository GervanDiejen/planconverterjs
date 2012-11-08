/* /upload */

var fs = require('fs'),
    exec = require('child_process').exec,
    config = require('../config.js');

/*
 * POST to /upload
 */
exports.post = function(req, res, next) {
    console.log('\nuploaded %s to %s', req.files.f.filename, req.files.f.path);

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
                    console.log('stdout: ' + stdout);
                    res.send(stdout);
                }
            });
};
