var TabController = function () {
    var state = this.findTabs({});

    var context = this;

    $.when(state).done(function (tabState) {
        context.state = tabState;
    });
};

TabController.prototype.state = [];

TabController.prototype.getCurrentTab = function (callback) {
    chrome.tabs.getCurrent(callback);
};

TabController.prototype.getTab = function (tabId, callback) {
    chrome.tabs.get(tabId, callback);
};

TabController.prototype.createTab = function (newTabProperties, callback) {
    chrome.tabs.get(newTabProperties, callback);
};

TabController.prototype.copyTab = function (tabId, callback) {
    chrome.tabs.duplicate(tabId, callback);
};

TabController.prototype.findTabs = function (findTabProperties) {
    var dfd = $.Deferred();
    var callback = function(tabs) {
        dfd.resolve(tabs);
    }
    chrome.tabs.query(findTabProperties, callback);

    return dfd;
};

TabController.prototype.updateTab = function (tabId, propertiesToUpdate, callback) {
    chrome.tabs.update(tabId, propertiesToUpdate, callback);
};

TabController.prototype.moveTab = function (tabId, moveProperties, callback) {
    chrome.tabs.move(tabId, moveProperties, callback);
};

TabController.prototype.moveManyTabs = function (tabIds, moveProperties, callback) {
    chrome.tabs.move(tabIds, moveProperties, callback);
};

TabController.prototype.refreshTab = function (tabId, refreshProperties, callback) {
    chrome.tabs.reload(tabId, refreshProperties, callbck);
};

TabController.prototype.closeTab = function (tabId, callback) {
    chrome.tabs.remove(tabId, callback);
};

TabController.prototype.closeManyTabs = function (tabIds, callback) {
    chrome.tabs.remove(tabIds, callback);
};

TabController.prototype.selectTab = function (tabId, callback) {
    updateTab(tabId, {'active': true}, callback);
};

var controller = new TabController();
//var tabs = controller.findTabs({});

/**
$.when(tabs).done(
    function (tabData) {
        console.log(tabData);
    }
);**/

