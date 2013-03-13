
function getCurrentTab (callback) {
    chrome.tabs.getCurrent(callback);
};

function getTab (tabId, callback) {
    chrome.tabs.get(tabId, callback);
};

function createTab (newTabProperties, callback) {
    chrome.tabs.get(newTabProperties, callback);
};

function copyTab (tabId, callback) {
    chrome.tabs.duplicate(tabId, callback);
};

function findTabs (findTabProperties, callback) {
    chrome.tabs.query(findTabProperties, callback);
};

function updateTab (tabId, propertiesToUpdate, callback) {
    chrome.tabs.update(tabId, propertiesToUpdate, callback);
};

function moveTab (tabId, moveProperties, callback) {
    chrome.tabs.move(tabId, moveProperties, callback);
};

function moveManyTabs (tabIds, moveProperties, callback) {
    chrome.tabs.move(tabIds, moveProperties, callback);
};

function refreshTab (tabId, refreshProperties, callback) {
    chrome.tabs.reload(tabId, refreshProperties, callbck);
};

function closeTab (tabId, callback) {
    chrome.tabs.remove(tabId, callback);
};

function closeManyTabs (tabIds, callback) {
    chrome.tabs.remove(tabIds, callback);
};

chrome.tabs.query({status:'complete'}, function (tabs) {
    console.log(tabs);
});

