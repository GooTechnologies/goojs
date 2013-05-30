define [	
], ()->


	###*
	* @class Utility to set log levels for the debug console in the browser. Static class. Usage: 
	* <code>
	* require (['goo/util/ConsoleUtil'], function(console) {
	* 	console.setLogLevel('warn');	
	*		console.log('This message will NOT be printed');
	* 	console.warn('This warning will be printed');
	* 	console.clearLogLevel();
	*		console.log('This message will be printed');
	* }
	* </code>
	*
	*###
	class Console
		levels = ['debug','log','info','warn','error']
		noop = -> #

		###*
		* Set the log level. Messages with lower urgency will not be printed.
		*
		* @param {string} newLevel Minimum urgency level. One of <code>['debug','log','info','warn','error']</code> (ordered by priority).
		*###
		@setLogLevel: (newLevel)->
			@clearLogLevel()
			for level in levels
				if level == newLevel then break
				@[level] = noop
			
		###*
		* Reset the log level. All messages will be printed.
		*###
		@clearLogLevel:->
			for level in levels
				@[level] = window.console[level]
	
	Console.clearLogLevel()
	
	return Console