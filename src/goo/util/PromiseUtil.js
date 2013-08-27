define([
	'goo/util/rsvp'
], function(
	RSVP
) /* @lends */ {
	// REVIEW: This doesn't look like GooJS code, see ArrayUtil.js
	return {

		/**
		 * Create a promise that resolves or rejects immediately with the given argument.
		 *
		 * @param {any} arg
		 * @param {any} error
		 * @returns {RSVP.Promise}
		 *
		 */
		createDummyPromise: function(arg, error) {
			var promise;
			promise = new RSVP.Promise();
			if (error != null) {
				promise.reject(error);
			} else {
				promise.resolve(arg);
			}
			return promise;
		},

		/**
		 * Create a promise that resolves or rejects after the specified delay with the given argument.
		 *
		 * @param {Number} delay in ms
		 * @returns {RSVP.Promise}
		 *
		 */
		defer: function(delay, arg) {
			var p1, p2, promise;
			promise = new RSVP.Promise();
			if (arg.apply) {
				p1 = new RSVP.Promise();
				p2 = p1.then(function() {
					return arg();
				});
				setTimeout(function() {
					// REVIEW: returns are useless here
					return p1.resolve();
				}, delay);
				return p2;
			} else {
				setTimeout(function() {
					// REVIEW: returns are useless here
					return promise.resolve(arg);
				}, delay);
			}
			return promise;
		}
	};
});
