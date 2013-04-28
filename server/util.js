/**
* Given an array of tabs representing a client's bound tabs,
* filter by only those tabs that are active.
*
* @param {Array.Object} clientData
* @return {Array.Object} activePages
*/
exports.filterByActive = function (clientData) {
	var activePages= [];

	for (var i = 0; i < clientData.length; i++) {
		if (clientData[i].active) {
			activePages.push(clientData[i]);
		}
	}

	return activePages
};

/**
* Given an array of tabs representing a client's bound tabs,
* filter by tabs bound to a particular window id.
*
* @param {Array.Object} clientData
* @param {Number} windowId
* @return {Array.Object} windowMapping A filtered array of tabs
*/
exports.filterByWindow = function (clientData, windowId) {
	var windowMapping = [];

	for (var i = 0; i < clientData.length; i++) {
		if (clientData[i].windowId === windowId) {
			windowMapping.push(clientData[i]);
		}
	}

	return windowMapping;
};

/**
* Given an array of tabs representing a client's bound tabs,
* arrange them by their window ID.
*
* @param {Array.Object} clientData
* @return {Object} windowMapping
*/
exports.windowToTabs = function (clientData) {
	var windowMapping = {}

	for (var i = 0; i < clientData.length; i++) {
		var tab = clientData[i];
		var mapping = windowMapping[tab.windowId];

		if (mapping) {
			windowMapping[tab.windowId].push(tab);
		} else {
			windowMapping[tab.windowId] = [tab];
		}
	}

	return windowMapping;
};
