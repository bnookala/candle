// Required
var _ = require('underscore');
var express = require('express');
var http = require('http');
var sio = require('socket.io')

// Local
var util = require('./util.js')

// Start up the servers
var app = express();
var server = http.createServer(app);
var io = sio.listen(server);
server.listen(8090);

// Configure the environment
app.configure(function () {
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use('/public', express.static(__dirname + '/public'));
});

// TODO: Store this data in some kind of in memory database.
// If the node server dies this data is lost until the clients reconnect.
clientSessionToGuid = {};
clientState = {};

clientGuidToSocket = {};

app.get('/', function (req, res) {
    var clients = [];

    _.each(clientState, function (clientData, clientId) {
        var activePages = util.filterByActive(clientData);

        clients.push({
            id: clientId,
            data: clientData,
            active: activePages
        });
    });

    res.render('index.html', {
        clients: clients
    });
});

// Print out all information about a connected client.
app.get('/client/:clientid', function (req, res) {
    // Get data associated with a specific monitor.
    var clientId = req.param('clientid');
    var clientData = clientState[clientId];

    var activePages = util.filterByActive(clientData);

    res.render('client.html', {
        clientId: clientId,
        client: clientData,
        activePages: activePages
    })
});

// Primitive select tab function.
app.get('/client/:clientid/select/:tabId', function (req, res) {
    var clientId = req.param('clientid');
    var tabId = parseInt(req.param('tabId'));

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || typeof tabId !== 'number') {
        res.send(404, 'Bad client id or tab id');
    } else {
        clientSocket.emit('client.selectTab', tabId);
        res.send(200);
    }

});

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
