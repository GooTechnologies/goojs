define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function ClickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;

		this.selected = false;
		this.x = 0;
		this.y = 0;

		var that = this;
		this.downListener = function (evt) {
			if (!evt.entity) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.x = evt.x;
					that.y = evt.y;
					that.selected = true;
					return false;
				}
			});
		};
		this.upListener = function (evt) {
			if (!this.selected) {
				return;
			}

			that.selected = false;
			if (!evt.entity) {
				return;
			}

			var diffx = that.x - evt.x;
			var diffy = that.y - evt.y;
			if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
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

	ClickAction.prototype = Object.create(Action.prototype);
	ClickAction.prototype.constructor = ClickAction;

	ClickAction.external = {
		name: 'Click/Tap',
		type: 'controls',
		description: 'Listens for a click/tap event on the entity and performs a transition',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'click',
			name: 'On Click/Tap',
			description: 'State to transition to when entity is clicked'
		}]
	};

	ClickAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('mousedown', this.downListener);
		this.goo.addEventListener('touchstart', this.downListener);
		this.goo.addEventListener('mouseup', this.upListener);
		this.goo.addEventListener('touchend', this.upListener);
		this.updated = false;
		this.selected = false;
	};

	ClickAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.click);
		}
	};

	ClickAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('mousedown', this.downListener);
			this.goo.removeEventListener('touchstart', this.downListener);
			this.goo.removeEventListener('mouseup', this.upListener);
			this.goo.removeEventListener('touchend', this.upListener);
		}
	};

	return ClickAction;
});
