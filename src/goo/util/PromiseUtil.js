define([
	'goo/util/rsvp'
], function(
	RSVP
) /* @lends */ {
	"use strict";

	var PromiseUtil = {};

	/**
	 * Create a promise that resolves or rejects immediately with the given argument.
	 *
	 * @param {any} arg
	 * @param {any} error
	 * @returns {RSVP.Promise}
	 *
	 */
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
	 * @returns {RSVP.Promise} that resolves with an object {results:[], errors: []}
	 * where results contains the results of all promises that resolved, and errors
	 * contain the errors from all promises that were rejected.
	 */
	PromiseUtil.optimisticAll = function(promises) {
		var resolved = 0,
			len = promises.length,
			output = {results:[], errors:[]},
			promise = new RSVP.Promise();

		if (len > 0) {
			for (var i = 0; i < len; i++){
				promises[i].then(function(result) {
					output.results.push(result);
					resolved++;
					if (resolved === len){
						promise.resolve(output);
					}
				},
				function(error) {
					output.errors.push(error);
					resolved++;
					if (resolved === len){
						promise.resolve(output);
					}
				});
			}
		}
		else {
			promise.resolve(output);
		}
		return promise;
	}


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
