define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function PickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(evt) {
			if(evt.entity === this.ownerEntity) {
				this.updated = true;
			}
		}.bind(this);
	}

	PickAction.prototype = Object.create(Action.prototype);
	PickAction.prototype.constructor = PickAction;

	PickAction.external = {
		name: 'Pick',
		description: 'Listens for a picking event and performs a transition',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'Fired when picked'
		}]
	};

	PickAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('click', this.eventListener);
	};

	PickAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.pick);
		}
	};

	PickAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('click', this.eventListener);
		}
	};

	return PickAction;
});