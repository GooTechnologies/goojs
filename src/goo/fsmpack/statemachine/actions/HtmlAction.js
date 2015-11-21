var Action = require('../../../fsmpack/statemachine/actions/Action');

	'use strict';

	function HtmlAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function () {
			this.updated = true;
		}.bind(this);
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
			name: 'Pick',
			description: 'State to transition to when the HTML entity is picked'
		}]
	};

	HtmlAction.prototype._setup = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	HtmlAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.pick);
		}
	};

	HtmlAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	module.exports = HtmlAction;