define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function ClickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.selected = false;
		this.x = 0;
		this.y = 0;
	}

	ClickAction.prototype = Object.create(Action.prototype);
	ClickAction.prototype.constructor = ClickAction;

	ClickAction.external = {
		key: 'Click/Tap',
		name: 'Click/Tap on entity',
		type: 'controls',
		description: 'Listens for a click/tap event on the entity and performs a transition.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'click',
			description: 'State to transition to when entity is clicked.'
		}]
	};

	ClickAction.getTransitionLabel = function(/*transitionKey, actionConfig*/){
		return 'On Click/Tap Entity';
	};

	ClickAction.prototype.enter = function (fsm) {
		var that = this;
		this.downListener = function (event) {
			var x, y;
			var domTarget = that.goo.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}
			var pickingStore = that.goo.pickSync(x, y);
			var pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.x = x;
					that.y = y;
					that.selected = true;
					return false;
				}
			});
		};
		this.upListener = function (event) {
			if (!that.selected) {
				return;
			}

			that.selected = false;

			var x, y;
			var domTarget = that.goo.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}
			var pickingStore = that.goo.pickSync(x, y);
			var pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			var diffx = that.x - x;
			var diffy = that.y - y;
			if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					fsm.send(that.transitions.click);
					return false;
				}
			});
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousedown', this.downListener);
		document.addEventListener('touchstart', this.downListener);
		document.addEventListener('mouseup', this.upListener);
		document.addEventListener('touchend', this.upListener);

		this.selected = false;
	};

	ClickAction.prototype.exit = function () {
		document.removeEventListener('mousedown', this.downListener);
		document.removeEventListener('touchstart', this.downListener);
		document.removeEventListener('mouseup', this.upListener);
		document.removeEventListener('touchend', this.upListener);
	};

	return ClickAction;
});
