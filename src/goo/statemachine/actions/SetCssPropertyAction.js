define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetCssPropertyAction(settings) {
		this.type = 'SetCssPropertyAction';

		settings = settings || {};

		this.selector = settings.selector || 'body';
		this.property = settings.property || 'background-color';
		this.value = settings.value || 'black';

		this.external = {
			selector: ['string', 'Selector'],
			property: ['string', 'Property'],
			value: ['string', 'Value']
		};
	}

	SetCssPropertyAction.prototype = {
		create: function(fsm) {
			$(this.selector).css(this.property, this.value);
		}
	};

	Actions.register('SetCssPropertyAction', SetCssPropertyAction);
	return SetCssPropertyAction;
});