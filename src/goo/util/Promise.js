define([

	], function(

	) {

	// REVIEW: Does this use some kind of "standard" API for promises? It looks like it's copied from somewhere. Where?
	// The Promise class is inspired by CommonJS Promises/A and jQuery deferred objects.
	// CommonJS Promises/A: http://wiki.commonjs.org/wiki/Promises/A
	// jQuery deferred: https://github.com/jquery/jquery/blob/master/src/deferred.js

	function Promise() {
		this._state = 'pending';
		this._resolved = [];
		this._rejected = [];
		this._always = [];
	}

	Promise.prototype.then = function(fulfilledHandler, errorHandler) {
		if(fulfilledHandler && fulfilledHandler !== null) {
			this._resolved.push(fulfilledHandler);
		}
		if(errorHandler && errorHandler !== null) {
			this._rejected.push(errorHandler);
		}

		return this;
	};

	Promise.prototype.done = function(callback) {
		if(this._state === 'pending') {
			this.then(callback);
		} else if(this._state === 'resolved') {
			callback(this._data);
		}

		return this;
	};

	Promise.prototype.fail = function(callback) {
		if(this._state === 'pending') {
			this.then(null, callback);
		} else if(this._state === 'rejected') {
			callback(this._data);
		}

		return this;
	};

	Promise.prototype.always = function(callback) {
		if(typeof callback !== 'undefined' && callback !== null) {
			if(this._state === 'pending') {
				this._always.push(callback);
			} else {
				callback(this._data);
			}
		}

		return this;
	};

	return Promise;
});