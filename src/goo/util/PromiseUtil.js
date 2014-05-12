define([
	'goo/util/rsvp'
],
/** @lends */
function(
	RSVP
){
	"use strict";

	/**
	* @class
	*/
	var PromiseUtil = {};

	/**
	 * Create a promise that resolves or rejects immediately with the given argument.
	 *
	 * @param {any} arg
	 * @param {any} error
	 * @returns {RSVP.Promise}
	 *
	 */

	//! AT: make this execute asynchronously with a 0ms delay (use postMessage)
	PromiseUtil.createDummyPromise = function(arg, error) {
		var promise;
		promise = new RSVP.Promise();
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
	PromiseUtil.optimisticAll = function(promises) {
		var resolved = 0,
			len = promises.length,
			results = [],
			promise = new RSVP.Promise();

		if (len > 0) {
			for (var i = 0; i < len; i++){
				(function(i) {
					promises[i].then(function(result) {
						results[i] = result;
						resolved++;
						if (resolved === len){
							promise.resolve(results);
						}
					},
					function(error) {
						results[i] = error;
						resolved++;
						if (resolved === len){
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
	 * Create a promise that resolves or rejects after the specified delay with the given argument.
	 *
	 * @param {Number} delay in ms
	 * @returns {RSVP.Promise}
	 *
	 */
	PromiseUtil.defer = function(delay, arg) {
		var p1, p2, promise;
		promise = new RSVP.Promise();
		if (arg.apply) {
			p1 = new RSVP.Promise();
			p2 = p1.then(function() {
				return arg();
			});
			setTimeout(function() {
				p1.resolve();
			}, delay);
			return p2;
		} else {
			setTimeout(function() {
				promise.resolve(arg);
			}, delay);
		}
		return promise;
	};

	return PromiseUtil;
});
