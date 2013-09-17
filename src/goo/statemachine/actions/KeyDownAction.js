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

	function KeyDownAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		var key = settings.key || 'w';

		this.key = (typeof key === 'number') ? key : StateUtils.keys[key];
		// variable to store the key and moment of press?

		this.eventToEmmit = settings.eventToEmmit || null;

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

	KeyDownAction.external = [
		{
			name: 'Key',
			key: 'key',
			type: 'key'
		},
		{
			name: 'Send event',
			key: 'event',
			type: 'event'
		}];

	KeyDownAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype._run = function(proxy) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmmit) {
				proxy.send(this.eventToEmmit.channel, this.eventToEmmit.data);
			}
		}
	};

	KeyDownAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return KeyDownAction;
});