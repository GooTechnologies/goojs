define([

	], function(

	) {

	/**
	 * The Promise class creates an object that will fire different handlers depending on if it's resolved or rejected. When the Promise is resolved or rejected it will save the value it was resolved or rejected with, and then call the corresponding handlers.<br/>
	 * Once a Promise has been resolved or rejected it will never change its internal value. In other words a resolved Promise can't be rejected, and a rejected Promise can't be resolved.<br/>
	 * The Promise class' methods all return the instance of the promise, so it is possible to chain the setup of handlers.<br/>
	 * <br/>
	 * <em>Note: It's not practical to create a Promise by its constructor. A promise does not have any methods for resolving of rejecting itself. The creation and handling of Promises is done with a Deferred class.</em>
	 *
	 * @constructor
	 * @example
	 * // Create a new Promise
	 * var promise = new Promise();
	 * 
	 * // Attach a callback for when the promise is resolved
	 * promise.done(function(data) {
	 *   console.log(data);
	 * });
	 *
	 * // Attach a callback for when the promise is rejected
	 * promise.fail(function(data) {
	 *   console.log(data);
	 * });
	 *
	 * // Create a Deferred object so we can change the Promise's state
	 * var deferred = new Deferred(promise);
	 *
	 * // This will resolve the Promise and run the
	 * // attached callbacks with the resolve argument
	 * deferred.resolve('We are resolved!');
	 *
	 * // The reject() function won't do anything now since
	 * // the promise has already been resolved on the previous line
	 * deferred.reject('Bad stuff');
	 *
	 *
	 */
	function Promise() {
		this._state = 'pending';
		this._resolved = [];
		this._rejected = [];
		this._always = [];
	}

	/**
	 * Attaches event handlers to the Promise.
	 *
	 * @param {Function} resolvedHandler Runs when the Promise is resolved.
	 * @param {Function} rejectedHandler Runs when the Promise is rejected.
	 * @return {Promise} Returns the Promise.
	 */
	Promise.prototype.then = function(resolvedHandler, rejectedHandler) {
		if(resolvedHandler && resolvedHandler !== null) {
			this._resolved.push(resolvedHandler);
		}
		if(rejectedHandler && rejectedHandler !== null) {
			this._rejected.push(rejectedHandler);
		}

		return this;
	};

	/**
	 * Attaches an event handler to the Promise.
	 *
	 * @param {Function} resolvedHandler Runs when the Promise is resolved.
	 * @return {Promise} Returns the Promise.
	 */
	Promise.prototype.done = function(resolvedHandler) {
		if(this._state === 'pending') {
			this.then(resolvedHandler);
		} else if(this._state === 'resolved') {
			resolvedHandler(this._data);
		}

		return this;
	};

	/**
	 * Attaches an event handler to the Promise.
	 *
	 * @param {Function} rejectedHandler Runs when the Promise is rejected.
	 * @return {Promise} Returns the Promise.
	 */
	Promise.prototype.fail = function(rejectedHandler) {
		if(this._state === 'pending') {
			this.then(null, rejectedHandler);
		} else if(this._state === 'rejected') {
			rejectedHandler(this._data);
		}

		return this;
	};

	/**
	 * Attaches an event handler to the Promise that fires when the Promise is rejected or resolved.
	 *
	 * @param {Function} alwaysHandler Runs when the Promise is resolved or rejected.
	 * @return {Promise} Returns the Promise.
	 */
	Promise.prototype.always = function(alwaysHandler) {
		if(typeof alwaysHandler !== 'undefined' && alwaysHandler !== null) {
			if(this._state === 'pending') {
				this._always.push(alwaysHandler);
			} else {
				alwaysHandler(this._data);
			}
		}

		return this;
	};

	return Promise;
});