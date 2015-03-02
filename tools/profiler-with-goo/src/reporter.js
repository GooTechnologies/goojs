(function () {
	'use strict';

	function request(url, callback) {
		var httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState == 4) {
				if (httpRequest.status == 200) {
					callback(httpRequest.responseText);
				} else {
					throw new Error('Could not retrieve ' + url);
				}
			}
		};

		httpRequest.open('GET', url);
		httpRequest.send();
	}

	function report() {
		request('../../../../mapping.json', function (jsonString) {
			var mapping = JSON.parse(jsonString);

			var touched = [];
			__touched.forEach(function (value, key) {
				touched[key] = value;
			});

			var resultWindow = window.open('../../../../../../src/report.html', '');
			resultWindow.onload = function () {
				resultWindow.postMessage({
					mapping: mapping,
					touched: touched
				}, '*');
			};
		});
	}

	window.report = report;
})();