var app = require('express')()
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(8090);

// TODO: Store this data in some kind of in memory database.
// If the node server dies this data is lost until the clients reconnect.
clientSessionToGuid = {};
clientState = {};

app.get('/', function (req, res) {
    res.send(200, 'This is Candle Server, running on Express with socket.io');
});

app.get('/client/:clientid', function (req, res) {
    // Get data associated with a specific monitor.
    var clientId = req.param('clientid');
    var clientData = clientState[clientId];

    if (clientData) {
        res.send(200, clientData);
    } else {
        res.send(404, 'Client data not found');
    }
});

io.sockets.on('connection', function (socket) {
    socket.on('client.stateChanged', function (data) {
        // Get the monitor name
        var monitorName = clientSessionToGuid[socket.sessionid];

        // Set the client's tabstate.
        clientState[monitorName] = data['0'];
    });

    socket.on('client.config', function (config) {
        // Get the monitor name the client is sending us.
        var monitorName = config['monitorName'];

        // Set the session id mapping to the monitor name.
        clientSessionToGuid[socket.sessionid] = monitorName;
        console.log(monitorName);
    });
});
