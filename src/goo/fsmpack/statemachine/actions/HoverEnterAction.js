define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function HoverEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;

		this.currentEntity = null;

		var that = this;
		this.moveListener = function (evt) {
			if (!evt.entity) {
				that.currentEntity = null;
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity && that.currentEntity !== that.ownerEntity) {
					that.updated = true;
					return false;
				}
			});

			that.currentEntity = evt.entity;
		};
	}

	HoverEnterAction.prototype = Object.create(Action.prototype);
	HoverEnterAction.prototype.constructor = HoverEnterAction;

	HoverEnterAction.external = {
		name: 'Hover Enter',
		type: 'controls',
		description: 'Listens for a hover enter event on the entity and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			name: 'On Enter',
			description: 'State to transition to when entity is entered'
		}]
	};

	HoverEnterAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('mousemove', this.moveListener);
		this.goo.addEventListener('touchmove', this.moveListener);
		this.updated = false;

		this.currentEntity = false;
	};

	HoverEnterAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			console.log('transition!', this.currentEntity);
			// fsm.send(this.transitions.enter);
		}
	};

	HoverEnterAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('mousemove', this.moveListener);
			this.goo.removeEventListener('touchmove', this.moveListener);
		}
	};

	return HoverEnterAction;
});
