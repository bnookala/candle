// Save this script as `options.js`

var candleOptionsApp = angular.module('candleOptionsApp', []);

candleOptionsApp.controller('OptionsController', function ($scope) {
	$scope.serverAddress = window.localStorage['serverAddress'];
	$scope.monitorName = window.localStorage['monitorName'];

	$scope.submit = function (monitorName, serverAddress) {
		if (serverAddress) {
			window.localStorage["serverAddress"] = serverAddress;
		} else {
			window.localStorage["serverAddress"] = "http://127.0.0.1:8090"
		}
	};
});
