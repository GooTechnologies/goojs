var rsvp = require('../util/rsvp');

	'use strict';

	/**
	 * Provides promise-related utility methods
	 */
	function PromiseUtils() {}

	//! AT: converting from PromiseUtils.createPromise to new RSVP.Promise is going to be trivial
	/**
	 * Same as ES6 `new Promise`
	 * @param fun
	 * @returns {RSVP.Promise}
	 */
	PromiseUtils.createPromise = function (fun) {
		var promise = new RSVP.Promise();

		fun(function (value) {
			promise.resolve(value);
		}, function (reason) {
			promise.reject(reason);
		});

		return promise;
	};

	//! AT: in line with the native Promise.resolve
	/**
	 * Creates a promise that resolves with the given argument.
	 * @param value
	 */
	PromiseUtils.resolve = function (value) {
		var promise = new RSVP.Promise();
		promise.resolve(value);
		return promise;
	};

	//! AT: in line with the native Promise.reject
	/**
	 * Creates a promise that resolves with the given argument.
	 * @param reason
	 */
	PromiseUtils.reject = function (reason) {
		var promise = new RSVP.Promise();
		promise.reject(reason);
		return promise;
	};


	var createDummyPromiseWarn = false;
	/**
	 * Create a promise that resolves or rejects immediately with the given argument.
	 * @deprecated Use PromiseUtils.resolve/reject instead.
	 * @param {any} arg
	 * @param {any} error
	 * @returns {RSVP.Promise}
	 */
	PromiseUtils.createDummyPromise = function (arg, error) {
		if (!createDummyPromiseWarn) {
			createDummyPromiseWarn = true;
			console.warn('PromiseUtils.createDummyPromise is deprecated; please consider using PromiseUtils.resolve/reject instead');
		}

		var promise = new RSVP.Promise();
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve(arg);
		}
		return promise;
	};


	/**
	 * Returns a promise that resolves when all given promises are resolved or rejected.
	 * Like RSVP.all(), except that instead of rejecting, this promise always resolves.
	 *
	 * @param {Array} promises
	 * @returns {RSVP.Promise} that resolves with the results of the promises. If a
	 * promise fails, the result of that promise will be the error. But the returned
	 * promise will always resolve with an array of objects.
	 */
	PromiseUtils.optimisticAll = function (promises) {
		var resolved = 0,
			len = promises.length,
			results = [],
			promise = new RSVP.Promise();

		if (len > 0) {
			for (var i = 0; i < len; i++) {
				(function (i) {
					promises[i].then(function (result) {
						results[i] = result;
						resolved++;
						if (resolved === len) {
							promise.resolve(results);
						}
					},
					function (error) {
						results[i] = error;
						resolved++;
						if (resolved === len) {
							promise.resolve(results);
						}
					});
				})(i);
			}
		}
		else {
			promise.resolve(results);
		}
		return promise;
	};

	/**
	 * Creates a promise that is resolved within a given amount of time
	 * @param value
	 * @param {number} time
	 * @returns {Promise}
	 */
	PromiseUtils.delay = function (value, time) {
		var promise = new RSVP.Promise();
		setTimeout(function () {
			promise.resolve(value);
		}, time);
		return promise;
	};

	// the doc doesn't align with half of what this function actually does
	/**
	 * Create a promise that resolves or rejects after the specified delay with the given argument.
	 * @deprecated Deprecated as of v0.14.x and scheduled for removal in v0.16.0; consider using
	 * PromiseUtils.delay instead
	 * @param {number} delay in ms
	 * @returns {RSVP.Promise}
	 */
	PromiseUtils.defer = function (delay, arg) {
		var p1, p2, promise;
		promise = new RSVP.Promise();
		if (arg.apply) {
			p1 = new RSVP.Promise();
			p2 = p1.then(function () {
				return arg();
			});
			setTimeout(function () {
				p1.resolve();
			}, delay);
			return p2;
		} else {
			setTimeout(function () {
				promise.resolve(arg);
			}, delay);
		}
		return promise;
	};

	module.exports = PromiseUtils;
