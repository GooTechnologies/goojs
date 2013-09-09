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
	function KeyDownAction(settings) {
		this.type = 'KeyDownAction';

		settings = settings || {};
		
		var key = settings.key || 'w';

		this.key = (parseFloat(key) == key)?key:StateUtils.keys[key];
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

	KeyDownAction.prototype = {
		create: function(fsm) {
			$(document).keydown(function(event) {
				var keyCode = event.which || event.keyCode;
				if (this.key === keyCode) {
					fsm.handle(this.event);
				}
			}.bind(this));
		},
		destroy: function() {
			$(document).off('keydown');
		}
	};

	Actions.register('KeyDownAction', KeyDownAction);
	return KeyDownAction;
});