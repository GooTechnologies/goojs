define([
		'lib/rsvp.amd'
	], function(
		RSVP
	) {

	/**
	 * Subclass of Promise. Wrapper class around an XHR call.
	 *
	 * @constructor
	 * @param {Object} [options={ url: '', method: 'URL' }] The XHR options.
	 */
	function Ajax(options) {
		RSVP.Promise.call(this);
		
		options = options || {};

		var method = options.method || 'GET';
		var url = options.url || '';
		var request = new XMLHttpRequest();
		
		request.open(method, url, true);

		var that = this;
		request.onreadystatechange = function () {
			if ( request.readyState === 4 ) {
				if ( request.status >= 200 && request.status <= 299 ) {
					that.resolve(request);
				} else {
					that.reject(request);
				}
			}
		};

		request.send();
	}
	Ajax.prototype = new RSVP.Promise();
	Ajax.prototype.constructor = Ajax;

	return Ajax;
});