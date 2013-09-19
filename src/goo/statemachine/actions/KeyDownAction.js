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

	function KeyDownAction(id, settings) {
		this.id = id;
		
		this.configure(settings||{});

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

	KeyDownAction.prototype = Object.create(Action.prototype);


	KeyDownAction.prototype.configure = function(settings) {
		this.everyFrame = settings.everyFrame || true;
		this.eventToEmit = { channel: settings.transitions.keydown };
		var key = settings.key || 'a';
		this.key = (typeof key === 'number') ? key : FSMUtil.keys[key];
		// variable to store the key and moment of press?
		this.transitions = settings.transitions || {};
	};

	KeyDownAction.external = {};
	KeyDownAction.external.parameters = [
		{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for',
			'default': 'w'
		}
	];

	KeyDownAction.external.transitions = [
		{
			name: 'keydown',
			description: 'Fired on key down'
		}
	];



	KeyDownAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype._run = function(proxy) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				proxy.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	KeyDownAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return KeyDownAction;
});