define([
	'goo/statemachine/StateUtils',
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
	StateUtils,
	Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function KeyUpAction(settings) {
		settings = settings || {};

		var key = settings.key || 'w';

		this.key = (parseFloat(key) === key) ? key : StateUtils.keys[key];
		this.event = settings.event || 'dummy';

		this.external = [
		{
			name: 'Key',
			key: 'key',
			type: 'key'
		},
		{
			name:'Send event',
			key:'event',
			type:'event'
		}];
	}

	KeyUpAction.prototype = {
		onCreate: function(fsm) {
			$(document).keyup(function(event) {
				var keyCode = event.which || event.keyCode;
				if (this.key === keyCode) {
					fsm.handle(this.event);
				}
			}.bind(this));
		},
		onDestroy: function() {
			$(document).off('keyup');
		}
	};

	Actions.register('KeyUpAction', KeyUpAction);
	return KeyUpAction;
});