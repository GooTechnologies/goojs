define([
		'goo/lib/rsvp.amd'
	],
	/** @lends */
	function(
		RSVP
	) {

	/**
	 * @class Subclass of Promise. Wrapper class around an XHR call.
	 * @constructor
	 * @description Creates a new Ajax instance.
	 */
	function Ajax() {}

	/**
	 * Uses GET to retrieve data at a remote location.
	 *
	 * @param {string} options.url
	 * @return {Promise} Returns a promise that is resolved and rejected with the XMLHttpRequest.
	 */
	Ajax.prototype.get = function(options) {
		var promise = new RSVP.Promise();

		options = options || {};

		var url = options.url || '';

		var method = 'GET';
		var async = true;

		var request = new XMLHttpRequest();

		if (options.responseType) {
			request.responseType = options.responseType;
		}

		request.open(method, url, async);


		request.onreadystatechange = function () {
			if ( request.readyState === 4 ) {
				if ( request.status >= 200 && request.status <= 299 ) {
					promise.resolve(request);
				} else {
					promise.reject(request.statusText);
				}
			}
		};

		request.send();

		return promise;
	};

	return Ajax;
});