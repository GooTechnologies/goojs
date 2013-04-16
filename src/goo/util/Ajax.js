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
	 * @param {function(object)} progressCallback A function receiving an object on the form<br />
	 * <code>{
	 *   loaded: number Bytes loaded
	 *   total: number Bytes to load
	 *   count: number Number of resources loaded/loading
	 * }</code>
	 */
	function Ajax(progressCallback) {
		this._loadStack = [];
		this._callback = progressCallback;

	}

	/**
	 * Uses GET to retrieve data at a remote location.
	 *
	 * @param {object} options
	 * @param {string} options.url
	 * @return {Promise} Returns a promise that is resolved and rejected with the XMLHttpRequest.
	 */
	Ajax.prototype.get = function(options) {
		var promise = new RSVP.Promise();

		var progress = this._progress.bind(this);
		var payload = {
			loaded: 0,
			total: 0,
			lengthComputable: false
		};
		this._loadStack.push(payload);

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
					payload.loaded = payload.total;
					progress();
					promise.resolve(request);
				} else {
					promise.reject(request.statusText);
				}
			}
		};

		request.addEventListener('progress', function(evt) {
			payload.loaded = evt.loaded || evt.position;
			payload.total = evt.total || evt.totalSize;
			payload.lengthComputable = evt.lengthComputable;

			progress();
		}, false);

		request.send();

		return promise;
	};

	Ajax.prototype._progress = function() {
		if (this._callback) {
			var obj = {
				total: 0,
				loaded: 0,
				count: this._loadStack.length
			};
			for (var i = 0; i < this._loadStack.length; i++) {
				obj.total += this._loadStack[i].total;
				obj.loaded += this._loadStack[i].loaded;
			}
			this._callback(obj);
		}
	};

	return Ajax;
});