define(function() {
	'use strict';

	/**
	 * Provides simple methods for loading multiple assets at once.
	 */
	function SimpleResourceUtil() {
	}

	SimpleResourceUtil.countdown = function(count, callback, data) {
		count[0]--;
		if (count[0] === 0) {
			callback.onSuccess(data);
		}
	};

	SimpleResourceUtil.loadTextAsset = function(count, i, urls, keys, data, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', urls[i], true);
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					data[keys[i]] = request.responseText;
					SimpleResourceUtil.countdown(count, callback, data);
				} else {
					callback.onError(request.statusText);
				}
			}
		};
		request.send();
	};

	SimpleResourceUtil.loadTextAssets = function(urls, keys, callback) {
		var count = [urls.length];
		var data = {};
		for ( var i = 0, max = urls.length; i < max; i++) {
			SimpleResourceUtil.loadTextAsset(count, i, urls, keys, data, callback);
		}
	};

	return SimpleResourceUtil;
});
