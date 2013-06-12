define [	
	'goo/util/rsvp'
], (RSVP)->

	###*
	* Create a promise that resolves immediately with the given argument.
	*
	* @param {any} arg 
	* @returns {RSVP.Promise}
	*###
	createDummyPromise: (arg)->
		promise = new RSVP.Promise()
		promise.resolve(arg)
		return promise
