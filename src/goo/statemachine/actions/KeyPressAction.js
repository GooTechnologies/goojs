define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	Action,
	StateUtils
) {
	"use strict";

	function KeyPressAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		var key = settings.key || 'w';

		this.key = (parseFloat(key) === key) ? key : StateUtils.keys[key];
		this.event = settings.event || 'dummy';
	}

	KeyPressAction.prototype = Object.create(Action.prototype);

	KeyPressAction.external = [
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

	// not onCreate and onDestroy
	KeyPressAction.prototype.onCreate = function(fsm) {
		$(document).keypress(function(event) {
			var charCode = event.which || event.keyCode;
			//var charStr = String.fromCharCode(charCode);
			if (charCode === this.key) {
				fsm.handle(this.event);
			}
		}.bind(this));
	};

	KeyPressAction.prototype.onDestroy = function() {
		$(document).off('keypress');
	};

	return KeyPressAction;
});