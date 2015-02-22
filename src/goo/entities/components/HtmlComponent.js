define([
	'goo/entities/components/Component'
],
function (
	Component
) {
	'use strict';

	/**
	 * HTML Component.
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlComponent(domElement) {
		Component.apply(this, arguments);

		this.type = 'HtmlComponent';

		/**
		 * DOM element.
		 */
		this.domElement = domElement;

		this._isVisual = true;

		/**
		 * @type {boolean}
		 */
		this.useTransformComponent = true;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	return HtmlComponent;
});
