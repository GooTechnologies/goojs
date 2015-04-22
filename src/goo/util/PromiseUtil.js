define([
	'goo/util/rsvp'
], function (
	RSVP
) {
	'use strict';

	/**
	 * Provides promise-related utility methods
	 */
	function PromiseUtil() {}

	//! AT: converting from PromiseUtil.createPromise to new RSVP.Promise is going to be trivial
	/**
	 * Same as ES6 `new Promise`
	 * @param fun
	 * @returns {RSVP.Promise}
	 */
	PromiseUtil.createPromise = function (fun) {
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
	PromiseUtil.resolve = function (value) {
		var promise = new RSVP.Promise();
		promise.resolve(value);
		return promise;
	};

	//! AT: in line with the native Promise.reject
	/**
	 * Creates a promise that resolves with the given argument.
	 * @param reason
	 */
	PromiseUtil.reject = function (reason) {
		var promise = new RSVP.Promise();
		promise.reject(reason);
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
	PromiseUtil.optimisticAll = function (promises) {
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
		} else {
			promise.resolve(results);
		}
		return promise;
	};

	/**
	 * Creates a promise that will be resolved within the specified amount of time with a given value
	 * @param {number} time In milliseconds
	 * @param {*} value Value to solve the promise with
	 * @returns {Promise}
	 */
	PromiseUtil.delay = function (time, value) {
		var promise = new RSVP.Promise();
		setTimeout(function () {
			promise.resolve(value);
		}, time);
		return promise;
	};

	return PromiseUtil;
});
