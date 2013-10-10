define(['goo/statemachine/actions/Action'],
/** @lends */
function(
	Action
	) {
	"use strict";

	function ScriptAction(script) {
		this.script = script || 'console.log("hello!")';

		this.external = [{
			name: 'Script',
			key: 'script',
			type: 'string'
		}];
	}

	ScriptAction.prototype = Object.create(Action.prototype);

	ScriptAction.prototype.onCreate = function(/*fsm*/) {
		/* jshint evil: true */
		eval(this.script);
	};

	return ScriptAction;
});