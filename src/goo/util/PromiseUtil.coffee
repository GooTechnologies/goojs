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


	###*
	* Create a promise that resolves after the specified delay 
	*
	* @param {Number} delay in ms 
	* @returns {RSVP.Promise}
	*###
	defer: (delay, arg)->
		promise = new RSVP.Promise()
		if arg.apply
			p1 = new RSVP.Promise()
			p2 = p1.then ->
			 	arg()

			setTimeout ->
				p1.resolve()
			,delay

			return p2

		else
			setTimeout ->
				promise.resolve(arg)
			, delay
		return promise