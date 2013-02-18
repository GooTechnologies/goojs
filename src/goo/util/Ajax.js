define([
		'lib/rsvp.amd'
	],
	/** @lends Ajax */
	function(
		RSVP
	) {

	/**
	 * Subclass of Promise. Wrapper class around an XHR call.
	 *
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
		
		request.open(method, url, true);

		
		request.onreadystatechange = function () {
			if ( request.readyState === 4 ) {
				if ( request.status >= 200 && request.status <= 299 ) {
					promise.resolve(request);
				} else {
					promise.reject(request);
				}
			}
		};

		request.send();

		return promise;
	}

	return Ajax;
});