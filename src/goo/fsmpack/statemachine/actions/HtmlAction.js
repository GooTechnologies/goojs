define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function HtmlAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	HtmlAction.prototype = Object.create(Action.prototype);
	HtmlAction.prototype.constructor = HtmlAction;

	HtmlAction.external = {
		name: 'HTMLPick',
		type: 'controls',
		description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			description: 'State to transition to when the HTML entity is picked'
		}]
	};

	HtmlAction.getTransitionLabel = function(/*transitionKey, actionConfig*/){
		return 'HTML Pick';
	};

	HtmlAction.prototype.enter = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.eventListener = function () {
				fsm.send(this.transitions.pick);
			}.bind(this);
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	HtmlAction.prototype.exit = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent && this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	return HtmlAction;
});