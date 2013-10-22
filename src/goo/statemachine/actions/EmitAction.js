define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function EmitAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	EmitAction.prototype = Object.create(Action.prototype);
	EmitAction.prototype.constructor = EmitAction;

	EmitAction.external = {
		parameters: [{
			name: 'Channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to transmit on',
			'default': ''
		}, {
			name: 'Data',
			key: 'data',
			type: 'string',
			description: 'Data to send',
			'default': ''
		}],
		transitions: []
	};

	EmitAction.prototype._run = function(fsm) {
		fsm.send(this.channel, this.data);
	};

	return EmitAction;
});