define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(Action) {
	'use strict';

	function SetCssPropertyAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.selector = settings.selector || 'body';
		this.property = settings.property || 'background-color';
		this.value = settings.value || 'black';
	}

	SetCssPropertyAction.prototype = Object.create(Action.prototype);

	SetCssPropertyAction.external = [{
			selector: ['string', 'Selector'],
			property: ['string', 'Property'],
			value: ['string', 'Value']
		}];

	// not onCreate
	SetCssPropertyAction.prototype.onCreate = function(/*fsm*/) {
		$(this.selector).css(this.property, this.value);
	};

	return SetCssPropertyAction;
});