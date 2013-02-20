
/* helpers */
planconverterjs.__helpers = {
    constants : {
        EARTH_RADIUS : 3438.145, /* earth radius in nm */
        FLIGHT_PLAN_CLASS_NAME : "flightplan",
        FLIGHT_PLAN_TABLE_COLS : 6,
        PLN_TO_JSON_ACTION : "/plntojson",
        GET_WAYPOINTS_ACTION : "/waypoint",
    },
    functions : {
        /* helper function to write coordinate numbers in a nicer format */
        write_coord_nums : function(l) {
            var ret = "";
            /* degrees */
            ret += Math.floor(l) + "*";
            l -= Math.floor(l);

            /* minutes */
            ret += " " + Math.floor(l * 60.0) + "'";
            l = l * 60.0 - Math.floor(l * 60.0);

            /* seconds */
            ret += " " + (l * 60.0).toFixed(2) + "\"";
            return ret;
        },
        /* create a jQuery table cell element with the provided data */
        make_cell : function(data, th) {
            var cell = $(th === undefined ? "<td>" : "<th>", {
                "class" : planconverterjs.__helpers.constants.FLIGHT_PLAN_CLASS_NAME
            });
            cell.html(data);
            return cell;
        }
    }
}
