/*
 * config settings
 */
exports.command_name = "python " + __dirname + "/parser/planconverterjs.py";
exports.jsontopln_command = "python " + __dirname + "/parser/jsontopln.py";
exports.server = {};
exports.server.port = process.env.PORT || 3000;
exports.server.host = process.env.HOST || 'http://localhost:' + exports.server.port;
