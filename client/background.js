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

    chrome.storage.local.get(['monitorName', 'serverAddress'], this.connect.bind(this));
};

TabController.prototype.connect = function (settings) {
    var monitorName, host;

    if ($.isEmptyObject(settings)) {
        monitorName = guid();
        host = 'http://localhost:8090';
        chrome.storage.local.set({'monitorName': monitorName, 'serverAddress': host});
    } else {
        monitorName = settings['monitorName'];
        host = settings['serverAddress'];
    }

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

TabController.prototype.toggleRotation = function (windowId) {
    var context = this;

    // Wait 7.5 seconds between changes.
    var waitTime = 7500;

    if (context.currentlyRotating[windowId]) {
        // CLear the interval and delete it.
        window.clearInterval(context.currentlyRotating[windowId]);
        context.currentlyRotating[windowId] = undefined;
    } else {
        context.currentlyRotating[windowId] = window.setInterval(
            context.rotateWindow.bind(context),
            waitTime,
            windowId
        );
    }
};

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