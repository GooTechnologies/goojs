define [	
	'goo/util/rsvp'
], (RSVP)->

	###*
	* Create a promise that resolves immediately with the given argument.
	*
	* @param {any} arg 
	* @returns {RSVP.Promise}
	*###
	dummyPromise: (arg)->
		# REVIEW: Function names should be verb constructs (see code style),
		# e.g. createDummyPromise
		promise = new RSVP.Promise()
		promise.resolve(arg)
		return promise
