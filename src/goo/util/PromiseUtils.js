define(function () {
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
		return new Promise(fun);
	};

	//! AT: in line with the native Promise.resolve
	/**
	 * Creates a promise that resolves with the given argument.
	 * @param value
	 */
	PromiseUtils.resolve = function (value) {
		return Promise.resolve(value);
	};

	//! AT: in line with the native Promise.reject
	/**
	 * Creates a promise that resolves with the given argument.
	 * @param reason
	 */
	PromiseUtils.reject = function (reason) {
		return Promise.reject(reason);
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
		var resolved = 0;
		var results = [];

		return new Promise(function (resolve, reject) {
			if (promises.length > 0) {
				promises.forEach(function (promise, index) {
					var boundResolveReject = function (resultReason) {
						results[index] = resultReason;
						resolved++;

						if (resolved >= promises.length) {
							resolve(results);
						}
					};

					promise.then(boundResolveReject, boundResolveReject);
				});
			} else {
				resolve(results);
			}
		});
	};

	/**
	 * Creates a promise that is resolved within a given amount of time
	 * @param value
	 * @param {number} time
	 * @returns {Promise}
	 */
	PromiseUtils.delay = function (value, time) {
		return new Promise(function (resolve) {
			setTimeout(resolve, time);
		});
	};

	PromiseUtils.all = function () {
		return Promise.all.apply(Promise, arguments);
	};

	PromiseUtils.isPromise = function (obj) {
		return obj instanceof Promise;
	};

	return PromiseUtils;
});
