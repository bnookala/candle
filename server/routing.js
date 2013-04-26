var _ = require('underscore');
var util = require('./util.js');

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
