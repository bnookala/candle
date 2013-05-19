var _ = require('underscore');
var express = require('express');
var jade = require('jade');

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

    res.render('index', {
        clients: clients
    });
};

client = {};

client.index = function (req, res) {
    var clientId = req.param('clientid');
    var clientData = clientState[clientId];

    var activePages = util.filterByActive(clientData);
    var windowData = util.windowToTabs(clientData);

    res.render('client', {
        clientId: clientId,
        clientData: clientData,
        activePages: activePages,
        windowData: windowData
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

client.rotateByWindowId = function (req, res) {
    res.send(200);
};

exports.candle = function (expressApp, sessionToGuid, state, guidToSocket) {
    app = expressApp;
    clientSesssionToGuid = sessionToGuid;
    clientState = state;
    clientGuidToSocket = guidToSocket;

    // Configure the environment
    app.configure(function () {
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use('/public', express.static(__dirname + '/public'));
    });

    //TODO: Finish moving the web server layer out of the main server file.
    app.get('/', root);

    // Print out all information about a connected client.
    app.get('/client/:clientid', client.index);

    // Primitive select tab function.
    app.get('/client/:clientid/select/:tabid',  client.selectByTabId);

    app.get('/client/:clientid/close/:tabid', client.closeByTabId);

    app.get('/client/:clientid/rotate/:windowid', client.rotateByWindowId);
};
