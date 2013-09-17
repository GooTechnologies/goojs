define([
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	StateUtils
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function KeyUpAction(settings) {
		settings = settings || {};

		var key = settings.key || 'w';

		this.key = (typeof key === 'number') ? key : StateUtils.keys[key];
		// variable to store the key and moment of press?

		this.eventToEmmit = settings.eventToEmmit || null;

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

		this.updated = false;
		this.eventListener = function(event) {
			//console.log('.......... keyup');

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

	KeyUpAction.prototype = {
		onEnter: function() {
			document.addEventListener('keyup', this.eventListener);
		},
		onUpdate: function(proxy) {
			if (this.updated) {
				this.updated = false;
				if (this.eventToEmmit) {
					proxy.send(this.eventToEmmit.channel, this.eventToEmmit.data);
				}
			}
		},
		onExit: function() {
			document.removeEventListener('keyup', this.eventListener);
		}
	};

	return KeyUpAction;
});