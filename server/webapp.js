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

client.removeClientData = function (req, res) {
    var clientId = req.param('clientid');

    delete clientState[clientId];
    delete clientGuidToSocket[clientId];

    res.send(200);
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

client.toggleRotationByWindowId = function (req, res) {
    var clientId = req.param('clientid');
    var windowId = parseInt(req.param('windowid'));

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || (windowId && typeof windowId !== 'number')) {
        res.send(404, 'Bad client id or window id');
    } else {
        clientSocket.emit('client.rotateWindow', windowId);
        res.send(200);
    }
};


client.openTabByWindowId = function (req, res) {
    var clientId = req.param('clientid');
    var windowId = parseInt(req.param('windowid'));

    var url = req.param('url');

    var clientSocket = clientGuidToSocket[clientId];

    if (!clientSocket || (windowId && typeof windowId !== 'number')) {
        res.send(404, 'Bad client id or window id');
    } else {
        clientSocket.emit('client.createTab', windowId, url);
        res.send(200);
    }
};

exports.candle = function (expressApp, sessionToGuid, state, guidToSocket) {
    app = expressApp;
    clientSesssionToGuid = sessionToGuid;
    clientState = state;
    clientGuidToSocket = guidToSocket;

    // Configure the environment
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use('/public', express.static(__dirname + '/public'));
    app.use('/bower_components', express.static(__dirname + '/bower_components'));

    // TODO: Finish moving the web server layer out of the main server file.
    app.get('/', root);

    // Print out all information about a connected client.
    app.get('/client/:clientid', client.index);

    app.get('/client/delete/:clientid', client.removeClientData);

    // Primitive select tab function.
    app.get('/client/:clientid/select/:tabid',  client.selectByTabId);

    app.get('/client/:clientid/close/:tabid', client.closeByTabId);

    app.get('/client/:clientid/rotate/:windowid', client.toggleRotationByWindowId);

    app.get('/client/:clientid/newtab/:windowid', client.openTabByWindowId);
};
