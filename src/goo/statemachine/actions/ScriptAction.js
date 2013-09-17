define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function ScriptAction(script) {
		this.script = script || 'console.log("hello!")';

		this.external = [{
			name: 'Script',
			key: 'script',
			type: 'string'
		}];
	}

	ScriptAction.prototype = {
		onCreate: function(/*fsm*/) {
			/* jshint evil: true */
			eval(this.script);
		}
	};

	return ScriptAction;
});