var _ = require('underscore');
var express = require('express');
var util = require('./util.js');

var clientSessionToGuid;
var clientState;
var clientGuidToSocket;
var app;


var root = function (req, res) {
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

client = {};

client.index = function (req, res) {
    var clientId = req.param('clientid');
    var clientData = clientState[clientId];

    var activePages = util.filterByActive(clientData);

    res.render('client.html', {
        clientId: clientId,
        client: clientData,
        activePages: activePages
    });
};

client.selectByTabId = function (req, res) {
    var clientId = req.param('clientid');
    var tabId = parseInt(req.param('tabid'));

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || (tabId && typeof tabId !== 'number')) {
        res.send(404, 'Bad client id or tab id');
    } else {
        clientSocket.emit('client.selectTab', tabId);
        res.send(200);
    }
};

client.closeByTabId = function (req, res) {
    var clientId = req.param('clientid');
    var tabId = parseInt(req.param('tabid'));

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || (tabId && typeof tabId !== 'number')) {
        res.send(404, 'Bad client id or tab id');
    } else {
        clientSocket.emit('client.closeTab', tabId);
        res.send(200);
    }
};

client.selectByWindowId = function (req, res) {
    res.send(200);
};

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
    app.get('/', root);

    // Print out all information about a connected client.
    app.get('/client/:clientid', client.index);

    // Primitive select tab function.
    app.get('/client/:clientid/select/:tabid',  client.selectByTabId);

    app.get('/client/:clientid/close/:tabid', client.closeByTabId);

    // See only tabs open on a particular window.
    app.get('/client/:clientid/window/:windowid', client.selectByWindowId);
};
