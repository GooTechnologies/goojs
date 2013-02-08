define([
		'goo/util/Promise'
	], function(
		Promise
	) {

	function Ajax(options) {
		Promise.call(this);

		options = options || {};

		var method = options.method || 'GET';
		var url = options.url || '';

		var request = new XMLHttpRequest();
		
		request.open(method, url, true);

		var that = this;
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299)
				{
					that._resolve(request);
				}
				else
				{

					that._reject(request);
				}
			}
		};

		request.send();
	}
	Ajax.prototype = new Promise();
	Ajax.prototype.constructor = Ajax;

	return Ajax;
});