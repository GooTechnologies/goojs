var Action = require('goo/fsmpack/statemachine/actions/Action');

	'use strict';

	function PickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		var that = this;
		this.eventListener = function (evt) {
			if (!evt.entity) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.updated = true;
					return false;
				}
			});
		};
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

	PickAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('click', this.eventListener);
		this.goo.addEventListener('touchstart', this.eventListener);
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
			this.goo.removeEventListener('touchstart', this.eventListener);
		}
	};

	module.exports = PickAction;
