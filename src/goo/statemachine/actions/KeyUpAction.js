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

	function KeyUpAction(settings) {
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

	KeyUpAction.prototype = Object.create(Action.prototype);

	KeyUpAction.external = [
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

	KeyUpAction.prototype._setup = function() {
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmmit) {
				fsm.send(this.eventToEmmit.channel, this.eventToEmmit.data);
			}
		}
	};

	KeyUpAction.prototype.exit = function() {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});