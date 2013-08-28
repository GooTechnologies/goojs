define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function ScriptAction(script) {
		this.type = 'ScriptAction';

		this.script = script || 'console.log("hello!")';

		this.external = [{
			name: 'Script',
			key: 'script',
			type: 'string'
		}];
	}

	ScriptAction.prototype = {
		create: function(fsm) {
			eval(this.script);
		}
	};

	Actions.register('ScriptAction', ScriptAction);
	return ScriptAction;
});