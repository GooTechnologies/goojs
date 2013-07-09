define [	
	'goo/util/rsvp'
], (RSVP)->

	###*
	* Create a promise that resolves or rejects immediately with the given argument.
	*
	* @param {any} arg 
	* @param {any} error 
	* @returns {RSVP.Promise}
	*###
	createDummyPromise: (arg, error)->
		promise = new RSVP.Promise()
		if error?
			promise.reject(error)
		else
			promise.resolve(arg)
		return promise
