define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	var ConsoleUtil, levels, noop, _console;
	_console = null;
	levels = ['debug', 'log', 'info', 'warn', 'error'];
	noop = function() {};
	return ConsoleUtil = {
		/**
		 * Set the log level. Messages with lower urgency will not be printed. Example usage:
		 * <code>
		 * require (['goo/util/ConsoleUtil'], function(ConsoleUtil) {
		 * 	ConsoleUtil.setLogLevel('warn');
		 * 	console.log('This message will NOT be printed');
		 * 	console.warn('This warning will be printed');
		 * 	ConsoleUtil.clearLogLevel();
		 * 	console.log('This message will be printed');
		 * }
		 * </code>
		 * @param {string} newLevel Minimum urgency level. One of <code>['debug','log','info','warn','error']</code> (ordered by priority).
		 *
		 */
		setLogLevel: function(newLevel) {
			var level, i;
			if (_console == null) {
				_console = _.clone(window.console);
			}
			ConsoleUtil.clearLogLevel();
			for (i = 0; i < levels.length; i++) {
				level = levels[i];
				if (level === newLevel) {
					break;
				}
				window.console[level] = noop;
			}
		},

		/**
		 * Reset the log level. All messages will be printed.
		 *
		 */
		clearLogLevel: function() {
			var level, i;
			if (_console) {
				for (i = 0; i < levels.length; i++) {
					level = levels[i];
					window.console[level] = _console[level];
				}
			}
		}
	};
});
