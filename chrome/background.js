var TabController = function () {
    var state = this.findTabs({});

    var context = this;

    $.when(state).done(function (tabState) {
        context.state = tabState;
    });
};

TabController.prototype.state = [];

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
