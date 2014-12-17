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
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example}
	 */
	function HtmlComponent(domElement) {
		Component.apply(this, arguments);

		this.type = 'HtmlComponent';

		/**
		 * DOM element.
		 */
		this.domElement = domElement;

		/**
		 * @type {boolean}
		 * @default 
		 */
		this.hidden = false;

		/**
		 * @type {boolean}
		 * @default
		 */
		this.useTransformComponent = true;
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	return HtmlComponent;
});
