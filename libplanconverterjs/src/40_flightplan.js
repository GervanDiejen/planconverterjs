
planconverterjs.flightplan = function(title) {
    this.title = title || 'Flight plan';
    this.wpts = [];

    /* append a waypoint to the plan */
    this.append_wpt = function(wpt) {
        this.wpts.push(wpt);
    }

    /* 
     * return a table element with the flight plan
     *
     * The parameter id is the id given to the html div element.
     */
    this.to_table = function(id) {
        if (this.wpts.length <= 0) {
            return "";
        }
        /* create the table element */
        var table = $("<table/>", {
            "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME,
            "id" : id
        });
        /* add a header row with the flight plan name */
        var header = $("<th/>", {
            "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME,
            "colspan" : planconverterjs.__helpers.constants.FLIGHT_PLAN_TABLE_COLS
        });
        header.html(this.title);
        table.append(
                $("<tr/>", {
                    "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME
                }).append($(header)));

        /* add a proper header row */
        header2 = $("<tr/>", {
            "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME
        });
        header2.append(planconverterjs.__helpers.functions.make_cell("", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("ID", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("Heading", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("Distance", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("Accumulated", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("Latitude", "th"));
        header2.append(planconverterjs.__helpers.functions.make_cell("Longitude", "th"));
        table.append(header2);
        
        /* add each waypoint on a row */
        acc = 0.0;
        table.append(this.wpts[0].to_row(0, acc));
        for (var i = 1; i < this.wpts.length; i++) {
            acc = acc + this.wpts[i-1].distance(this.wpts[i]);
            table.append(this.wpts[i].to_row(i, acc, this.wpts[i-1]));
        }
        return table;
    }

    this.to_skyvector_url = function() {
      var plan_url = "plan=";
      var tot_lat = 0;
      var tot_lon = 0;

      for (var i = 0; i < this.wpts.length; i++) {
        tot_lat += this.wpts[i].latitude;
        tot_lon += this.wpts[i].longitude;
        if (i > 0) {
          plan_url += ":"
        }
        plan_url += "G." + this.wpts[i].latitude + "," + this.wpts[i].longitude
      }
      var center = "ll=" + (tot_lat / this.wpts.length) + "," + (tot_lon / this.wpts.length);

      return "http://skyvector.com/?" + center + "&" + plan_url;
    }
}

planconverterjs.create_flightplan = function(title,str,cb) {
  var pln = str.split(' ');
  var rem = pln.length;
  var wpts = {};
  var i = 0;
  for (; i < pln.length; i++) {
    planconverterjs.get_waypoint(pln[i],
        function(w,e,d) {
          wpts[d] = w;
          rem--;
//          console.log('Waypoint: ' + w.icao + " d " + d + " rem " + rem);
          if (rem <= 0) {
            var fp = new planconverterjs.flightplan(title);
            for (var j = 0; j < pln.length; j++) {
              if (wpts[j] != null) {
                fp.append_wpt(wpts[j]);
              } else {
                console.log('Airport not found: ' + pln[j])
              }
            }
            cb(fp);
          }
        },
        i);

  }
}
