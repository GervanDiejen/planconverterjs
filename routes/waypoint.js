/*
 * Routes for /pln2json of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/navaids?auto_reconnect')

/*
 * GET from /waypoint
 */
exports.get = function(req, res, next) {
  var ans = [];
  var icaos = req.query.icao.split(',');
  var rems = icaos.length;

  console.log('icaos: ' + icaos);
  console.log('rems: ' + rems);

  icaos.forEach(function (icao) {
    db.collection('navaids').find({"icao" : icao}, function (err, cursor) {
      console.log("return for " + icao);
      if (err) {
        rems--;
        console.log('DB returned error: ' + str(err));
        next(new Error('unable to get waypoint'));
      } else {
        cursor.toArray(function (err,docs) {
          ans.push(docs);
          rems--;
          if (rems <= 0) {
            res.send(ans);
          }
        });
      }
    });
  });
};
