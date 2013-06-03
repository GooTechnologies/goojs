define [	
	'goo/lib/underscore'
], ()->

	_console = null
	levels = ['debug','log','info','warn','error']
	noop = -> #
	ConsoleUtil =
		
		###*
		* Set the log level. Messages with lower urgency will not be printed. Example usage: 
		* <code>
		* require (['goo/util/ConsoleUtil'], function(console) {
		* 	console.setLogLevel('warn');	
		*		console.log('This message will NOT be printed');
		* 	console.warn('This warning will be printed');
		* 	console.clearLogLevel();
		*		console.log('This message will be printed');
		* }
		* </code>
		* @param {string} newLevel Minimum urgency level. One of <code>['debug','log','info','warn','error']</code> (ordered by priority).
		*###
		setLogLevel: (newLevel)->
			_console ?= _.clone(window.console)
			ConsoleUtil.clearLogLevel()
			for level in levels
				if level == newLevel then break
				window.console[level] = noop
			
		###*
		* Reset the log level. All messages will be printed.
		*###
		clearLogLevel:->
			if _console
				for level in levels
					window.console[level] = _console[level]