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


	var createDummyPromiseWarn = false;
	/**
	 * Create a promise that resolves or rejects immediately with the given argument.
	 * @deprecated Use PromiseUtil.resolve/reject instead.
	 * @param {any} arg
	 * @param {any} error
	 * @returns {RSVP.Promise}
	 */
	PromiseUtil.createDummyPromise = function (arg, error) {
		if (!createDummyPromiseWarn) {
			createDummyPromiseWarn = true;
			console.warn('PromiseUtil.createDummyPromise is deprecated; please consider using PromiseUtil.resolve/reject instead');
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
		}
		else {
			promise.resolve(results);
		}
		return promise;
	};


	//! AT: this is insane code; the doc is wrong; the function never rejects
	// there' no mention of special handling of functions - which it does!
	/**
	 * Create a promise that resolves or rejects after the specified delay with the given argument.
	 *
	 * @param {Number} delay in ms
	 * @returns {RSVP.Promise}
	 */
	PromiseUtil.defer = function (delay, arg) {
		var p1, p2, promise;
		promise = new RSVP.Promise(); //! AT: this is not used in half of the function; why is it created nevertheless?
		if (arg.apply) { //! AT: vector also has a .apply method; what's wrong with instaceof or typeof?
			p1 = new RSVP.Promise();
			p2 = p1.then(function () { //! AT: why the extra wrapping
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

	return PromiseUtil;
});
