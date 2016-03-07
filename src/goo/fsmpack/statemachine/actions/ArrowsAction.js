define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	var keys = {
		38: 'up',
		37: 'left',
		40: 'down',
		39: 'right'
	};

	function ArrowsAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ArrowsAction.prototype = Object.create(Action.prototype);
	ArrowsAction.prototype.constructor = ArrowsAction;

	ArrowsAction.prototype.configure = function (settings) {
		this.targets = settings.transitions;
	};

	ArrowsAction.external = {
		key: 'Arrow Keys Listener',
		name: 'Arrow Keys',
		type: 'controls',
		description: 'Transitions to other states when arrow keys are pressed (keydown).',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'up',
			description: "On key up pressed."
		}, {
			key: 'left',
			description: "On key left pressed."
		}, {
			key: 'down',
			description: "On key down pressed."
		}, {
			key: 'right',
			description: "On key right pressed."
		}]
	};

	var labels = {
		up: 'Key UP',
		left: 'Key LEFT',
		down: 'Key DOWN',
		right: 'Key RIGHT'
	};

	ArrowsAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	ArrowsAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			var target = this.targets[keyname];
			if (target) {
				fsm.send(target);
			}
		}.bind(this);
		document.addEventListener('keydown', this.eventListener);
	};

	ArrowsAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	return ArrowsAction;
});