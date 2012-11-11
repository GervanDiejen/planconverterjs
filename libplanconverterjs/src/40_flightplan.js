
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
        var table = $("<table/>", {
            "class" : planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME,
            "id" : id
        });
        var header = $("<th/>", {
            "class" : planconverterjs.__helper.contants.FLIGHT_PLAN_CLASS_NAME,
            "colspan" : planconverterjs.__helper.constants.FLIGHT_PLAN_TABLE_COLS
        });
        header.html(this.title);
        table.append(
                $("<tr/>", {
                    "class" : planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME
                }).append($(header)));

        header2 = $("<tr/>", {
            "class" : planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME
        });
        header2.append("<th class=\"" +
                planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME +
                "\">ID</th>");
        header2.append("<th class=\"" +
                planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME +
                "\">Heading</th>");
        header2.append("<th class=\"" +
                planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME +
                "\">Distance</th>");
        header2.append("<th class=\"" +
                planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME +
                "\">Latitude</th>");
        header2.append("<th class=\"" +
                planconverterjs.__helper.constants.FLIGHT_PLAN_CLASS_NAME +
                "\">Longitude</th>");
        
        table.append(this.wpts[0].to_row());
        for (var i = 0; i < this.wpts.length; i++) {
            table.append(this.wpts[i].to_row(this.wpts[i-1]));
        }
        return table;
    }
}

