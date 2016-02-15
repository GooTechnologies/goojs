define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function PickAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PickAction.prototype = Object.create(Action.prototype);
	PickAction.prototype.constructor = PickAction;

	PickAction.external = {
		name: 'Pick',
		type: 'controls',
		description: 'Listens for a picking event on the entity and performs a transition',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'State to transition to when entity is picked'
		}]
	};

	PickAction.prototype.enter = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		var that = this;
		this.eventListener = function (evt) {
			if (!evt.entity) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					fsm.send(that.transitions.pick);
					return false;
				}
			});
		};

		this.goo.addEventListener('click', this.eventListener);
		this.goo.addEventListener('touchstart', this.eventListener);
	};

	PickAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('click', this.eventListener);
			this.goo.removeEventListener('touchstart', this.eventListener);
		}
	};

	return PickAction;
});
