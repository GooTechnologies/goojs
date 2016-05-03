var Action = require('../../../fsmpack/statemachine/actions/Action');

function HtmlAction() {
	Action.apply(this, arguments);
}

HtmlAction.prototype = Object.create(Action.prototype);
HtmlAction.prototype.constructor = HtmlAction;

HtmlAction.external = {
	key: 'HTMLPick',
	name: 'HTMLPick',
	type: 'controls',
	description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
	canTransition: true,
	parameters: [], // but not farther than some value
	transitions: [{
		key: 'pick',
		description: 'State to transition to when the HTML entity is picked.'
	}]
};

HtmlAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
	return 'On HTML Pick';
};

HtmlAction.prototype.enter = function () {
	var ownerEntity = this.getEntity();
	if (ownerEntity.htmlComponent) {
		this.eventListener = function () {
			this.sendEvent('pick');
		}.bind(this);
		this.domElement = ownerEntity.htmlComponent.domElement;
		this.domElement.addEventListener('click', this.eventListener);
	}
};

HtmlAction.prototype.exit = function () {
	var ownerEntity = this.getEntity();
	if (ownerEntity.htmlComponent && this.domElement) {
		this.domElement.removeEventListener('click', this.eventListener);
	}
};

module.exports = HtmlAction;