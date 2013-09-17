define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetCssPropertyAction(settings) {
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
		onCreate: function(/*fsm*/) {
			$(this.selector).css(this.property, this.value);
		}
	};

	return SetCssPropertyAction;
});