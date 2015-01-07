var TabController = function () {
    this.currentlyRotating = {};

    var context = this;

    // bind to all the chrome.tabs events
    var tabEvents = [
        chrome.tabs.onCreated,
        chrome.tabs.onUpdated,
        chrome.tabs.onMoved,
        chrome.tabs.onActivated,
        chrome.tabs.onHighlighted,
        chrome.tabs.onDetached,
        chrome.tabs.onAttached,
        chrome.tabs.onRemoved
    ];

    $.each(tabEvents, function (index, chromeEvent) {
        chromeEvent.addListener(context._updateInternalState.bind(context));
    });

    chrome.storage.onChanged.addListener(this.onStorageChange.bind(this));

    // Gets the configuration for this client, and begins the connection phase.
    chrome.storage.local.get(['monitorName', 'serverAddress'], this.getSettings.bind(this));
};

/**
    Unpack the settings we retrieved from from chrome.storage,
    and attempt to use it to connect to the candle server.
    @param {Object}
*/
TabController.prototype.getSettings = function (settings) {
    var monitorName, host;

    // If there are no settings for the client, create some.
    if ($.isEmptyObject(settings)) {
        monitorName = guid();
        host = 'http://localhost:8090';
        chrome.storage.local.set({'monitorName': monitorName, 'serverAddress': host});
    } else {
        // Otherwise, just reuse what we've found.
        monitorName = settings['monitorName'];
        host = settings['serverAddress'];
    }

    this.monitorName = monitorName;

    // Connect to the host.
    this.connect(host, monitorName);
};

/**
    Actually performs the connection. Send the client configuration/state
    to the new server and rebinds socket events.
    @param {string} host Fully qualified hostname of the server we're connecting to
    @param {string} monitorName The name of this monitor.
*/
TabController.prototype.connect = function (host, monitorName) {
    try {
        this.socket = io.connect(host);
    } catch (e) {
        alert("Could not connect to server at host: " + string(host));
    }

    var config = {
        'monitorName': monitorName,
    }

    this.socket.emit('client.config', config);

    this._updateInternalState();
    this._bindReceivedClientEvents();
};

/**
    Reacts to changes in settings.
*/
TabController.prototype.onStorageChange = function (changeSet) {
    if (changeSet['monitorName']) {
        var newName = changeSet['monitorName'].newValue;
        var oldName = changeSet['monitorName'].oldValue;

        this.monitorName = newName;

        this.socket.emit('client.monitorNameChange', oldName, newName);
    }

    if (changeSet['serverAddress']) {
        var newServer = changeSet['serverAddress'].newValue;
        this.socket.disconnect();
        this.socket = undefined;

        this.connect(newServer, this.monitorName);
    }
};

TabController.prototype.state = [];

TabController.prototype.socket = undefined;

TabController.prototype._deferredWrap = function () {
    var chromeFunction = Array.prototype.shift.call(arguments);
    var dfd = $.Deferred();

    var callback = function () {
        dfd.resolve(arguments);
    }

    var args = Array.prototype.slice.call(arguments);
    args.push(callback);

    chromeFunction.apply(this, args);
    return dfd;
};

TabController.prototype._updateInternalState = function () {
    var state = this.findTabs({});

    var context = this;

    $.when(state).done(function (newTabState) {
        context.state = newTabState;
        context.socket.emit('client.stateChanged', newTabState);
    });

    return state;
};

/**
    Binds to client events received from the server and runs callbacks
    as needed.
*/
TabController.prototype._bindReceivedClientEvents = function () {
    var context = this;

    // If the socket is ever in a reconnecting stage, we should resend our configuration
    this.socket.on('reconnect', function () {
        context.socket.emit('client.config', context.config);
    });

    // Primitive handler for selecting a tab.
    this.socket.on('client.selectTab', function (tabId) {
        context.selectTab(tabId);
    });

    this.socket.on('client.closeTab', function (tabId) {
        context.closeTab(tabId);
    });

    this.socket.on('client.rotateWindow', function (windowId) {
        context.toggleRotation(windowId);
    });

    this.socket.on('client.createTab', function (windowId, newTabUrl) {
        context.clientCreateTab(windowId, newTabUrl);
    });
};

/**
    Toggles rotation on a window.
    @param {windowId} The Id of the window to rotate.
*/
TabController.prototype.toggleRotation = function (windowId) {
    var context = this;

    // Wait 7.5 seconds between changes.
    var waitTime = 7500;

    if (context.currentlyRotating[windowId]) {
        // If the window is currently rotating, stop the rotation.
        window.clearInterval(context.currentlyRotating[windowId]);
        context.currentlyRotating[windowId] = undefined;
    } else {
        // Otherwise, start the rotation.
        context.currentlyRotating[windowId] = window.setInterval(
            context.rotateWindow.bind(context),
            waitTime,
            windowId
        );
    }
};

/**
    Rotates tabs on a window.
    @param {windowId} a Number that represents the window to rotate.
*/
TabController.prototype.rotateWindow = function (windowId) {
    var context = this;

    var state = this._updateInternalState();

    $.when(state).done(function () {
        var windowTabs = context._filterByWindowId(windowId);
        var activeTab = context._findActiveTabs(windowTabs, true);

        var tabIndex = context._nextTabIndex(activeTab, windowTabs);
        context.selectTab(tabIndex);
    });

};

/**
    Gets the id of the next tab to be shown when rotating.

    @param {currentActive} The currently active tab
    @param {tabsList} A list of tabs
    @returns The ID of the next available tab.
*/
TabController.prototype._nextTabIndex = function (currentActive, tabsList) {
    var activeIndex = currentActive.index;
    var nextIndex;

    if (activeIndex === tabsList[tabsList.length-1].index) {
        nextIndex = 0;
    } else {
        nextIndex = activeIndex + 1;
    }

    return tabsList[nextIndex].id;
};

/**
    Given a window id, searches the current client state
    for tabs that belong to the window and returns a list
    of tabs for that window.

    @param {windowId} The window Id to search for tabs for
    @returns a list of tabs that belong to the window
*/
TabController.prototype._filterByWindowId = function (windowId) {
    var tabs = [];
    var state = this.state[0];

    for (var i=0; i < state.length; i++) {
        if (state[i].windowId === windowId) {
            tabs.push(state[i]);
        }
    }

    return tabs
};

/**
    Helper function to find all active tabs in a list.
    @param {Array} tabsList The tabs to search
    @param {Boolean} returnSingle returns only a single active tab.
*/
TabController.prototype._findActiveTabs = function (tabsList, returnSingle) {
    if (!returnSingle) {
        var active = [];
    } else {
        var active;
    }

    for (var i=0; i < tabsList.length; i++) {
        if (tabsList[i].active) {
            if (!returnSingle) {
                active.push(tabsList[i]);
            } else {
                active = tabsList[i];
            }
        }
    }

    return active
};

TabController.prototype.clientCreateTab = function (windowId, newTabUrl) {
    var tabProperties = {
        url: newTabUrl,
        windowId: windowId,
    }

    this.createTab(tabProperties);
};


TabController.prototype.getCurrentTab = function () {
    return this._deferredWrap(
        chrome.tabs.getCurrent
    );
};

TabController.prototype.getTab = function (tabId) {
    return this._deferredWrap(
        chrome.tabs.get,
        tabId
    );
};

TabController.prototype.createTab = function (newTabProperties) {
    return this._deferredWrap(
        chrome.tabs.create,
        newTabProperties
    );
};

TabController.prototype.copyTab = function (tabId) {
    return this._deferredWrap(
        chrome.tabs.duplicate,
        tabId
    );
};

TabController.prototype.findTabs = function (findTabProperties) {
    return this._deferredWrap(
        chrome.tabs.query,
        findTabProperties
    );
};

TabController.prototype.updateTab = function (tabId, propertiesToUpdate) {
    return this._deferredWrap(
        chrome.tabs.update,
        tabId,
        propertiesToUpdate
    );
};

TabController.prototype.moveTab = function (tabId, moveProperties) {
    return this._deferredWrap(
        chrome.tabs.move,
        tabId,
        moveProperties
    );
};

TabController.prototype.moveManyTabs = function (tabIds, moveProperties) {
    return this._deferredWrap(
        chrome.tabs.move,
        tabIds,
        moveProperties
    );
};

TabController.prototype.refreshTab = function (tabId, refreshProperties) {
    return this._deferredWrap(
        chrome.tabs.reload,
        refreshProperties
    );
};

TabController.prototype.closeTab = function (tabId) {
    return this._deferredWrap(
        chrome.tabs.remove,
        tabId
    );
};

TabController.prototype.closeManyTabs = function (tabIds) {
    return this._deferredWrap(
        chrome.tabs.remove,
        tabIds
    );
};

TabController.prototype.selectTab = function (tabId) {
    return this._deferredWrap(
        chrome.tabs.update,
        tabId,
        {'active': true}
    );
};

var controller = new TabController();


function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function guid() {
       return [S4(), S4(), "-", S4(), "-", S4(), "-", S4(), "-", S4(), S4(), S4()].join('');
}