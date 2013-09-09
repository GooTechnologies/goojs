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
	function GuiButtonAction(settings) {
		this.type = 'GuiButtonAction';

		settings = settings || {};

		this.name = settings.name || 'Button';
		this.event = settings.event || 'dummy';

		this.external = [
		{
			name: 'Name',
			key: 'name',
			type: 'string'
		},
		{
			name: 'Send Event',
			key: 'event',
			type: 'event'
		}];
	}

	GuiButtonAction.prototype = {
		onEnter: function(fsm) {
			this.btn = $('<button/>', {
				text: this.name,
				css: {
					'position': 'relative',
					'z-index': 100
				},
				click: function() {
					fsm.handle(this.event);
				}.bind(this)
			}).appendTo($('body'));
		},
		onExit: function() {
			if (this.btn) {
				this.btn.remove();
			}
		}
	};

	Actions.register('GuiButtonAction', GuiButtonAction);

	return GuiButtonAction;
});