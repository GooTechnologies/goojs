define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	'use strict';

	function GuiButtonAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.name = settings.name || 'Button';
		this.event = settings.event || 'dummy';
	}

	GuiButtonAction.prototype = Object.create(Action.prototype);

	GuiButtonAction.external = [
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

	GuiButtonAction.prototype._setup = function(fsm) {
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
	};

	GuiButtonAction.prototype.exit = function() {
		if (this.button) {
			this.button.remove();
		}
	};

	return GuiButtonAction;
});