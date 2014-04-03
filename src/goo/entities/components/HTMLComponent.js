define([
	'goo/entities/components/Component'
], /** @lends */ function (
	Component
) {
	'use strict';

	/**
	 * HTML Compnent
	 * @class
	 * @extends Component
	 */
	function HTMLComponent(domElement) {
		Component.call(this);
		this.type = "HTMLComponent";

		this.domElement = domElement;

		this.hidden = false;
	}

	HTMLComponent.prototype = Object.create(Component.prototype);
	HTMLComponent.prototype.constructor = HTMLComponent;

	return HTMLComponent;
});
