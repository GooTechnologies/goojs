define([
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	StateUtils
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function KeyPressAction(settings) {
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

	KeyPressAction.prototype = {
		onCreate: function(fsm) {
			$(document).keypress(function(event) {
				var charCode = event.which || event.keyCode;
				//var charStr = String.fromCharCode(charCode);
				if (charCode === this.key) {
					fsm.handle(this.event);
				}
			}.bind(this));
		},
		onDestroy: function() {
			$(document).off('keypress');
		}
	};

	return KeyPressAction;
});