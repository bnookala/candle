// Required
var express = require('express');
var http = require('http');
var sio = require('socket.io')
var argv = require('yargs')
            .usage('Usage: $0 -p [num]')
            .example('$0 -p 8090', 'Start the server at port 8090')
            .example('$0 --port 8090', 'Start the server at port 8090')
            .demand(['p'])
            .alias('p', 'port')
            .describe('p', 'The port to start the candle server on.')
            .argv;

// Local
var routing = require('./webapp.js');

// Start up the servers
var app = express();
var server = http.createServer(app);
var io = sio.listen(server);

server.listen(argv.p);

// TODO: Store this data in some kind of in memory database.
// If the node server dies this data is lost until the clients reconnect.
clientSessionToGuid = {};
clientState = {};
clientGuidToSocket = {};

routing.candle(app, clientSessionToGuid, clientState, clientGuidToSocket);

io.sockets.on('connection', function (socket) {

    socket.on('client.stateChanged', function (data) {
        // Get the monitor name
        var monitorName = clientSessionToGuid[socket.id];

        // Set the client's tabstate.
        clientState[monitorName] = data['0'];
    });

    socket.on('client.config', function (config) {
        // Get the monitor name the client is sending us.
        var monitorName = config['monitorName'];

        // Set the session id mapping to the monitor name.
        clientSessionToGuid[socket.id] = monitorName;

        clientGuidToSocket[monitorName] = socket;
    });

    socket.on('disconnect', function () {
        // Get the monitor name
        var monitorName = clientSessionToGuid[socket.id];

        // Delete the client session->guid, and the client guid->socket,
        // so we don't end up having socket session dupes.
        delete clientSessionToGuid[socket.id];
        delete clientGuidToSocket[monitorName];
        delete clientState[monitorName];
    });
});
