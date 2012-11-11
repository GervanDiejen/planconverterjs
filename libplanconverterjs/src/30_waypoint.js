
/*
 * The waypoint class type.
 * The expected parameter is another waypoint object or an object returned
 * from the server.
 */
planconverterjs.waypoint = function(obj) {
    this.icao = obj.icao || 'ZZZZ';
    this.type = obj.type || 'User';
    this.latitude = parseFloat(obj.latitude) || 0.0;
    this.longitude = parseFloat(obj.longitude) || 0.0;

    /* return the latitude as a nicer formatted string */
    this.latitude_string = function() {
        var l = parseFloat(this.latitude);
        var ret = (l >= 0.0 ? "N" : "S");
        ret += this.__write_coord_nums(Math.abs(l))
        return ret;
    }
    
    /* return the longitude as a nicer formatted string */
    this.longitude_string = function() {
        var l = parseFloat(this.longitude);
        var ret = (l >= 0.0 ? "N" : "S");
        ret += this.__write_coord_nums(Math.abs(l))
        return ret;
    }

    /* return the distance between this waypoint and the waypoint b */
    this.distance = function(b) {
        var a_lat = this.latitude   * Math.PI / 180.0,
            a_lon = this.longitude  * Math.PI / 180.0,
            b_lat = b.latitude      * Math.PI / 180.0,
            b_lon = b.longitude     * Math.PI / 180.0;
        var d_lon = Math.abs(a_lon - b_lon);
        var c_ang = (Math.acos(Math.sin(a_lat)*Math.sin(b_lat) +
                Math.cos(a_lat)*Math.cos(a_lat)*Math.cos(d_lon)) *
                planconverterjs.__helpers.constants.EARTH_RADIUS);
    }

    /* return the heading between this waypoint and the waypoint b */
    this.heading_to = function(b) {
        var a_lat = this.latitude   * Math.PI / 180.0,
            a_lon = this.longitude  * Math.PI / 180.0,
            b_lat = b.latitude      * Math.PI / 180.0,
            b_lon = b.longitude     * Math.PI / 180.0;
        var d_lon = Math.abs(a_lon - b_lon);
        
        var y = Math.sin(d_lon)*Math.cos(b_lat);
        var x = Math.cos(a_lat)*Math.sin(b_lat) -
            Math.sin(a_lat)*Math.cos(b_lat)*Math.cos(d_lon);

        var head = Math.atan2(y,x) * 180.0 / Math.PI;
        head = Math.floor(head + 360) % 360;
        return head;
    }

    this.to_row = function(prev) {
        var row = $("<tr/>", {
            "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME
        });

        row.append(planconverterjs.__helpers.functions.make_cell(this.icao));

        var hdg = 0;
        if (prev !== undefined) {
            hdg = prev.heading_to(this);
        }
        row.append(planconverterjs.__helpers.functions.make_cell(hdg));
        
        var dist = 0;
        if (prev !== undefined) {
            dist = prev.distance(this);
        }
        row.append(planconverterjs.__helpers.functions.make_cell(dist));

        row.append(planconverterjs.__helpers.functions.make_cell(this.latitude_string()));
        row.append(planconverterjs.__helpers.functions.make_cell(this.longitude_string()));

        return row;
    }


    /* helper function to write coordinate numbers in a nicer format */
    this.__write_coord_nums =
        planconverterjs.__helpers.functions.write_coord_nums;
}
