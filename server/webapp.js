var _ = require('underscore');
var util = require('./util.js');

var clientSessionToGuid;
var clientState;
var clientGuidToSocket;
var app;

exports.candle = function (expressApp, sessionToGuid, state, guidToSocket) {
    app = expressApp;
    clientSesssionToGuid = sessionToGuid;
    clientState = state;
    clientGuidToSocket = guidToSocket;

    // Configure the environment
    app.configure(function () {
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'ejs');
        app.set('views', __dirname + '/views');
        app.use('/public', express.static(__dirname + '/public'));
    });

    //TODO: Finish moving the web server layer out of the main server file.
    app.get('/', function (req, res) {
        exports.root(clientState, req, res);
    });

    // Print out all information about a connected client.
    app.get('/client/:clientid', function (req, res) {
        exports.client.index(clientState, req, res);
    });


    // Primitive select tab function.
    app.get('/client/:clientid/select/:tabid', function (req, res) {
        exports.client.selectByTabId(clientGuidToSocket, req, res);
    });
};

exports.root = function (clientState, req, res) {
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
};

exports.client = {};

exports.client.index = function (clientState, req, res) {
    var clientId = req.param('clientid');
    var clientData = clientState[clientId];

    var activePages = util.filterByActive(clientData);

    res.render('client.html', {
        clientId: clientId,
        client: clientData,
        activePages: activePages
    });
};

exports.client.selectByTabId = function (clientGuidToSocket, req, res) {
    var clientId = req.param('clientid');
    var tabId = parseInt(req.param('tabid'));
    console.log(tabId);

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || (tabId && typeof tabId !== 'number')) {
        res.send(404, 'Bad client id or tab id');
    } else {
        clientSocket.emit('client.selectTab', tabId);
        res.send(200);
    }
};
