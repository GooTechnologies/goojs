define([
		'goo/util/Promise'
	], function(
		Promise
	) {

	/**
	 * A class providing the possibility to postpone an event.<br/>
	 * The Deferred instance manages events in a Promise object. The managed promise is set or created by the constructor.</br>
	 *
	 * @param {Promise} [promise] If set, the Deferred will manage this promise. Otherwise a new internal Promise is created.
	 *
	 * @example
	 * // Create a new Deferred object
	 * var deferred = new Deferred();
	 *
	 * // Attach a callback for when the deferred is resolved
	 * deferred.done(function(data) {
	 *   console.log(data);
	 * });
	 *
	 * // Attach a callback for when the deferred is rejected
	 * deferred.fail(function(data) {
	 *   console.log(data);
	 * });
	 *
	 * // This will resolve the internal Promise and run the
	 * // attached callbacks with the resolve argument
	 * deferred.resolve('We are resolved!');
	 *
	 * // The reject() function won't do anything now since
	 * // the promise has already been resolved on the previous line
	 * deferred.reject('Bad stuff');
	 *
	 *
	 *
	 *
	 * // We can also request the internal promise. This is
	 * // useful when creating deferred events in functions,
	 * // such as in loaders where only the loader should be
	 * // able to reject or resolve the internal promise.
	 * deferred.promise(); // Returns the internal Promise
	 *
	 */
	function Deferred(promise) {
		this._promise = promise || new Promise();
	}

	/**
	 * Gives access to the Deferred's internal Promise.
	 *
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.promise = function() {
		return this._promise;
	}

	/**
	 * Resolves the Deferred's internal Promise with the value in <code>data</code>.
	 *
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.resolve = function(data) {
		if(this._promise._state === 'pending') {

			this._promise._data = data;

			this._promise._resolved.every(function(fn) {
				fn(data);
				return true;
			});

			this._promise._always.every(function(fn) {
				fn(data);
				return true;
			});

			this._promise._state = 'resolved';
		}

		return this._promise;
	};

	/**
	 * Rejects the Deferred's internal Promise with the value in <code>data</code>.
	 *
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.reject = function(data) {
		if(this._promise._state === 'pending') {
			this._promise._data = data;

			this._promise._rejected.every(function(fn) {
				if(data instanceof Error) {
					throw data;
				}
				fn(data);
				return true;
			});

			this._promise._always.every(function(fn) {
				fn(data);
				return true;
			});

			this._promise._state = 'rejected';
		}

		return this._promise;
	};

	/**
	 * Attaches event handlers to the Deferred's internal Promise.
	 *
	 * @param {Function} resolvedHandler Runs when the internal Promise is resolved.
	 * @param {Function} rejectedHandler Runs when the internal Promise is rejected.
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.then = function(resolvedHandler, rejectedHandler) {
		return this._promise.then(resolvedHandler, rejectedHandler);
	};

	/**
	 * Attaches an event handler to the Deferred's internal Promise that fires when the Promise is resolved.
	 *
	 * @param {Function} resolvedHandler Runs when the internal Promise is resolved.
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.done = function(resolvedHandler) {
		return this._promise.done(resolvedHandler);
	};
	
	/**
	 * Attaches an event handler to the Deferred's internal Promise that fires when the Promise is rejected.
	 *
	 * @param {Function} rejectedHandler Runs when the internal Promise is rejected.
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.fail = function(rejectedHandler) {
		return this._promise.fail(rejectedHandler);
	};

	/**
	 * Attaches an event handler to the Deferred's internal Promise that fires when the Promise is rejected or resolved.
	 *
	 * @param {Function} alwaysHandler Runs when the internal Promise is rejected.
	 * @return {Promise} Returns the Deferred's internal Promise.
	 */
	Deferred.prototype.always = function(alwaysHandler) {
		return this._promise.always(alwaysHandler);
	};

	/**
	 * A static function that returns a new Promise that<br/>
	 *   a. is resolved when <strong>all</strong> passed Promise instances have been resolved
	 *   b. is rejected when <strong>any</strong> of the passed Promise instances is rejected
	 *
	 * The function is useful when wanting run some code once a number of things have already happened, e.g. "When Leonardo, Donatello, Michaelangelo, and Rafael are all ready THEN go fight the Shredder."
	 *
	 * @param {...Promise} promise
	 * @return {Promise} Returns a new Promise that is resolved by an array of values. The values are ordered the same way as the Promise instances were passed into the argument list.
	 *
	 * @example
	 * // This example shows how to create a combined Promise and chain events to that Promise
	 * // Leonardo, Donatello, Michaelangelo, and Rafael are all instances of Promise
	 * Deferred.when(Leonardo, Donatello, Michaelangelo, Rafael)
	 * .done(function(values) {
	 *   // All the Promise instances were resolved
	 *   var t = new Turtles({
	 *     leonardo: values[0],
	 *     donatello: values[1],
	 *     michaelangelo: values[2],
	 *     rafael: values[3]
	 *   });
	 *
	 *   t.fightTheShredder();
	 * })
	 * .fail(function(reason) {
	 *   // One or more of the Promises was rejected
	 *   console.warn(reason);
	 * })
	 */
	Deferred.when = function(promise /*, ..., promiseN */) {
		var	promises = Array.prototype.slice.call(arguments);
		var length = promises.length;
		var remaining = length;
		var when = new Deferred();
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