define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function GuiButtonAction(settings) {
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
			this.button = $('<button/>', {
				text: this.name,
				css: {
					'position': 'relative',
					'z-index': 10000
				},
				click: function() {
					fsm.send(this.event);
				}.bind(this)
			}).appendTo($('body'));
		},
		onExit: function() {
			if (this.button) {
				this.button.remove();
			}
		}
	};

	return GuiButtonAction;
});