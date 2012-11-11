

planconverterjs.get_data = function(form, callback) {
    var formdata = new FormData(form);

    $.ajax({
        url: planconverterjs.__helpers.constants.SERVER_URL,
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

