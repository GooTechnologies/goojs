define([
	'goo/entities/components/Component'
], /** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class HTML Component.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example}
	 * @extends Component
	 */
	function HtmlComponent_(domElement) {
		Component.call(this);
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

	var HtmlComponent = HtmlComponent_;

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	return HtmlComponent;
});
