define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function (
	Action
) {
	'use strict';

	function HTMLAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function () {
			this.updated = true;
		}.bind(this);
	}

	HTMLAction.prototype = Object.create(Action.prototype);
	HTMLAction.prototype.constructor = HTMLAction;

	HTMLAction.external = {
		name: 'HTMLPick',
		type: 'controls',
		description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'State to transition to when the HTML entity is picked'
		}]
	};

	HTMLAction.prototype._setup = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	HTMLAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.pick);
		}
	};

	HTMLAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	return HTMLAction;
});