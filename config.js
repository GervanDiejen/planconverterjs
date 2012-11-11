/*
 * config settings
 */
exports.command_name = "python " + __dirname + "/parser/planconverterjs.py";
exports.server = {};
exports.server.host = process.env.HOST || 'http://localhost';
exports.server.port = process.env.PORT || 3000;
exports.server.external_port = process.env.EXT_PORT || exports.server.port;
