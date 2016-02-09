define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/renderer/bounds/BoundingPicker'
], function (
	Action,
	BoundingPicker
) {
	'use strict';

	function HoverExitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.first = true;

		this.currentEntity = null;

		var that = this;
		this.moveListener = function (event) {
			if (that.first) {
				that.first = false;
				that.currentEntity = event.entity;
				return;
			}

			if (that.currentEntity === that.ownerEntity && event.entity !== that.currentEntity) {
				this.updated = true;
			}

			if (!event.entity) {
				that.currentEntity = null;
				return;
			}

			// event.entity.traverseUp(function (entity) {
			// 	if (entity === that.ownerEntity && that.currentEntity !== that.ownerEntity) {
			// 		that.updated = true;
			// 		return false;
			// 	}
			// });

			that.currentEntity = event.entity;
		};

		this.moveListenerBounds = function (event) {
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

			var camera = that.goo.renderSystem.camera;
			var pickList = BoundingPicker.pick(that.goo.world, camera, x, y);
			var pickResult = { entity: null };
			if (pickList.length > 0) {
				pickResult.entity = pickList[0].entity;
			}
			that.moveListener(pickResult);
		};
	}

	HoverExitAction.prototype = Object.create(Action.prototype);
	HoverExitAction.prototype.constructor = HoverExitAction;

	HoverExitAction.types = {
		fast: 'Bounding (Fast)',
		slow: 'Per pixel (Slow)',
	};

	HoverExitAction.external = {
		name: 'Hover Exit',
		type: 'controls',
		description: 'Listens for a hover exit event on the entity and performs a transition',
		canTransition: true,
		parameters: [{
			name: 'Accuracy',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Hover accuracy/performance selection',
			'default': HoverExitAction.types.fast,
			options: [HoverExitAction.types.fast, HoverExitAction.types.slow]
		}],
		transitions: [{
			key: 'exit',
			name: 'On Exit',
			description: 'State to transition to when entity is exited'
		}]
	};

	HoverExitAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		if (this.type === HoverExitAction.types.slow) {
			this.goo.addEventListener('mousemove', this.moveListener);
			this.goo.addEventListener('touchmove', this.moveListener);
		} else {
			document.addEventListener('mousemove', this.moveListenerBounds);
			document.addEventListener('touchmove', this.moveListenerBounds);
		}
		
		this.updated = false;
		this.first = true;
		this.currentEntity = null;
	};

	HoverExitAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.exit);
		}
	};

	HoverExitAction.prototype.exit = function () {
		if (this.goo) {
			if (this.type === HoverExitAction.types.slow) {
				this.goo.removeEventListener('mousemove', this.moveListener);
				this.goo.removeEventListener('touchmove', this.moveListener);
			} else {
				document.removeEventListener('mousemove', this.moveListenerBounds);
				document.removeEventListener('touchmove', this.moveListenerBounds);
			}
		}
	};

	return HoverExitAction;
});
