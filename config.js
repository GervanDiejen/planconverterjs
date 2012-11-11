/*
 * config settings
 */
exports.command_name = "python " + __dirname + "/parser/planconverterjs.py";
exports.server = {};
exports.server.port = process.env.PORT || 3000;
exports.server.host = process.env.HOST || 'http://localhost:' + exports.server.port;
