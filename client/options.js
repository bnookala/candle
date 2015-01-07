var candleOptionsApp = angular.module('candleOptionsApp', []);

candleOptionsApp.controller('OptionsController', function ($scope) {
	$scope.init = function () {
		var context = this;

		// Chrome storage retrieval is an aynchronous task and requires a
		// callback.
		chrome.storage.local.get(
			['serverAddress', 'monitorName'],
			context.setConfiguration.bind(context)
		);
	};

	$scope.setConfiguration = function (items) {
		$scope.serverAddress = items['serverAddress'];
		$scope.monitorName = items['monitorName'];

		// Since the binding may be done after the view is loaded,
		// we have to force the scope to rebind.
		$scope.$digest();
	};

	$scope.submit = function (monitorName, serverAddress) {
		if (serverAddress) {
			chrome.storage.local.set({'serverAddress': serverAddress});
		} else {
			chrome.storage.local.set({'serverAddress': "http://127.0.0.1:8090"});
		}

		if (monitorName) {
			chrome.storage.local.set({'monitorName': monitorName});
		}
	};

	$scope.init();
});
