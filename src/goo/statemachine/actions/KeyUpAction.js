define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMUtil'
],
/** @lends */
function(
	Action,
	FSMUtil
) {
	"use strict";

	function KeyUpAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		var key = settings.key || 'w';

		this.key = (typeof key === 'number') ? key : FSMUtil.keys[key];
		// variable to store the key and moment of press?

		this.eventToEmit = settings.eventToEmit || null;

		this.updated = false;
		this.eventListener = function(event) {
			if (event.which === this.key) { this.updated = true; }
			/*
			 if (this.posVariable) {
			 if (fsm.localVariables[this.posVariable] !== undefined) {
			 fsm.localVariables[this.posVariable] = [event.clientX, event.clientY];
			 } else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
			 FSMComponent.globalVariables[this.posVariable] = [event.clientX, event.clientY];
			 }
			 }
			 */
		}.bind(this);
	}

	KeyUpAction.prototype = Object.create(Action.prototype);

	KeyUpAction.external = {};
	KeyUpAction.external.parameters = [
		{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for',
			'default': 'w'
		}
	];

	KeyUpAction.external.transitions = [
		{
			name: 'On key up',
			description: 'Event fired on key up'
		}
	];

	KeyUpAction.prototype._setup = function() {
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	KeyUpAction.prototype.exit = function() {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});