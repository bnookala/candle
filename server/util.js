exports.filterByActive = function (clientData) {
	var activePages= [];

	for (var i = 0; i < clientData.length; i++) {
		if (clientData[i].active) {
			activePages.push(clientData[i]);
		}
	}

	return activePages
};
