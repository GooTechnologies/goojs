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
	function HtmlComponent(domElement) {
		Component.call(this);
		this.type = 'HtmlComponent';

		this.domElement = domElement;

		this.hidden = false;
		this.useTransformComponent = true;
	}

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	return HtmlComponent;
});
