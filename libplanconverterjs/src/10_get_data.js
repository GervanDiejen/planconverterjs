

planconverterjs.get_data = function(form, callback) {
    var formdata = new FormData(form);

    $.ajax({
        url: planconverterjs.config.host +
             planconverterjs.__helpers.constants.PLN_TO_JSON_ACTION,
        type: "POST",
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.title !== undefined) {
                fp = new planconverterjs.flightplan(data.title);
                for (var i = 0; i < data.wpts.length; i++) {
                    fp.append_wpt(new planconverterjs.waypoint(data.wpts[i]));
                }
                callback(fp, null);
            } else {
                callback(null, "error");
            }
        },
        error: function() {
            callback(null, "error");
        }
    });
}

planconverterjs.__get_waypoints = function(icaos, callback) {
  var dataObj = "icao=" + icaos;
  $.ajax({
    url: planconverterjs.config.host +
         planconverterjs.__helpers.constants.GET_WAYPOINTS_ACTION,
    type: "GET",
    data: dataObj,
    cache: false,
    contentType: false,
    processData: false,
    success: function (data) {
      if (data && data[0].length > 0) {
        var recvd_icaos = [];
        var i,j;
        for (i = 0; i < data.length; i++) {
          var icao = data[i][0].icao;
          if (data[i].length > 1) {
            /* figure out how to handle multiple values... */
            console.log("received more than expected... " + data[i].length);
          } else {
            planconverterjs.__data.waypoints[icao] = new planconverterjs.waypoint(data[i][0]);
          }
          recvd_icaos.push(icao);
        }
        callback(recvd_icaos, null);
      } else {
        callback(null, "data is null");
      }
    },
    error: function() {
      callback(null, "ajax returned error");
    }
  });
}
