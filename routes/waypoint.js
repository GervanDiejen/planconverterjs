/*
 * Routes for /pln2json of the application.
 *
 * Copyright (c) 2012, Klas Björkqvist
 * See COPYING for license information.
 */

var mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/navaids?auto_reconnect')

var special = {
  "YNPE" : "YBAM",
  "VADU" : "VA1P",
  "VOVZ" : "VEVZ",
  "WAQQ" : "WALR"
}
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
    var q = icao;
    if (q in special) {
      q = special[q];
    }
    db.collection('navaids').find({"icao" : q}, function (err, cursor) {
      console.log("return for " + icao + "(" + q + ")");
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
