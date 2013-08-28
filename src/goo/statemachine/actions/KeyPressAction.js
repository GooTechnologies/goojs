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
	function KeyPressAction(settings) {
		this.type = 'KeyPressAction';

		settings = settings || {};

		var key = settings.key || 'w';

		this.key = (parseFloat(key) == key)?key:Util.keys[key];
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

	KeyPressAction.prototype = {
		create: function(fsm) {
			$(document).keypress(function(event) {
				var charCode = event.which || event.keyCode;
				//var charStr = String.fromCharCode(charCode);
				if (charCode === this.key) {
					fsm.handle(this.event);
				}
			}.bind(this));
		},
		destroy: function() {
			$(document).off('keypress');
		}
	};

	Actions.register('KeyPressAction', KeyPressAction);
	return KeyPressAction;
});