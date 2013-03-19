var TabController = function () {
    this.config = this._fetchConfig();

    // Set up our connection with the server.
    this.socket = io.connect('http://localhost:8090');

    // Send it the client configuration
    this.socket.emit('client.config', this.config);

    // Figure out what state the client is in and send it to the server
    this._updateInternalState();

    var context = this;

    // If the socket is ever in a reconnecting stage, we should resend our configuration
    this.socket.on('reconnect', function () {
        context.socket.emit('client.config', context.config);
    });

    // Primitive handler for selecting a tab.
    this.socket.on('client.selectTab', function (tabId) {
        context.selectTab(tabId);
    });

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
};

TabController.prototype.state = [];

TabController.prototype.config = {};

TabController.prototype.socket = undefined;

TabController.prototype._fetchConfig = function () {
    // Some fake GUID generators found online. Obviously, there should be some
    // better scheme used at some point in the future, but this should suffice.
    function S4() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    function guid() {
           return [S4(), S4(), "-", S4(), "-", S4(), "-", S4(), "-", S4(), S4(), S4()].join('');
    }

    // Fetch some configuration things from localStorage.
    var monitorName;
    if (!window.localStorage.getItem('monitorName')) {
        monitorName = guid();
        window.localStorage.setItem('monitorName', monitorName);
    } else {
        monitorName = window.localStorage.getItem('monitorName');
    }

    // Return a dict representing the configuration for this client.
    return {
        'monitorName': monitorName
    };
};


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
