var candleOptionsApp = angular.module('candleOptionsApp', []);

candleOptionsApp.controller('OptionsController', function ($scope) {
	$scope.init = function () {
		var context = this;

		chrome.storage.sync.get(['serverAddress', 'monitorName'], function (items) {
			context.serverAddress = items['serverAddress'];
			context.monitorName = items['monitorName'];
		});
	};

	$scope.submit = function (monitorName, serverAddress) {
		if (serverAddress) {
			chrome.storage.sync.set({'serverAddress': serverAddress});
		} else {
			chrome.storage.sync.set({'serverAddress': "http://127.0.0.1:8090"});
		}

		if (monitorName) {
			chrome.storage.sync.set({'monitorName': monitorName});
		}
	};

	$scope.init();
});
