define([
		'goo/util/Promise'
	], function(
		Promise
	) {

	// REVIEW: Does this use some kind of "standard" API for promises? It looks like it's copied from somewhere. Where?
	// The Promise class is inspired by CommonJS Promises/A and jQuery deferred objects.
	// CommonJS Promises/A: http://wiki.commonjs.org/wiki/Promises/A
	// jQuery deferred: https://github.com/jquery/jquery/blob/master/src/deferred.js

	function Deferred(promise) {
		this._promise = promise || new Promise();
	}

	Deferred.prototype.promise = function() {
		return this._promise;
	}

	Deferred.prototype.resolve = function(data) {
		if(this.promise()._state === 'pending') {

			this.promise()._data = data;

			this.promise()._resolved.every(function(fn) {
				fn(data);
				return true;
			});

			this.promise()._always.every(function(fn) {
				fn(data);
				return true;
			});

			this.promise()._state = 'resolved';
		}

		return this.promise();
	};

	Deferred.prototype.reject = function(data) {
		if(this.promise()._state === 'pending') {
			this.promise()._data = data;

			this.promise()._rejected.every(function(fn) {
				fn(data);
				return true;
			});

			this.promise()._always.every(function(fn) {
				fn(data);
				return true;
			});

			this.promise()._state = 'rejected';
		}

		return this.promise();
	};

	Deferred.prototype.then = function(fulfilledHandler, errorHandler) {
		return this.promise().then(fulfilledHandler, errorHandler);
	};

	Deferred.prototype.done = function(callback) {
		return this.promise().done(callback);
	};
	
	Deferred.prototype.fail = function(callback) {
		return this.promise().fail(callback);
	};

	Deferred.prototype.always = function(callback) {
		return this.promise().always(callback);
	};

	Deferred.prototype.when = function(promise /*, ..., promiseN */) {
		var	promises = Array.prototype.slice.call(arguments);
		var length = promises.length;
		var remaining = length;
		var when = this;
		var values = [];

		// This runs every time a promise is resolved
		var updateFunction = function(i, values) {
			return function(value) {
				values[i] = value;

				if(--remaining <= 0){
					when.resolve(values);
				}
			};
		};

		// Add listeners to promises
		if(length > 0)
		{
			var rejectWhen = function(data) {
				when.reject(data);
			};
			
			for(var i in promises) {
				// If `promises[i]` exists and is a function
				if(promises[i] && Object.prototype.toString.call(promises[i].constructor) === '[object Function]') {
					promises[i]
						.done(updateFunction(i, values))
						.fail(rejectWhen);
				} else { // It's not a function, treat as if resolved
					--remaining;
				}
			}
		}

		// If we're not waiting for anything we resolve
		if(!remaining)
		{
			when.resolve(values);
		}

		return when.promise();
	};

	return Deferred;
});